<?php
/**
 * Document Insights: the public tracking endpoint.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Rest;

use BPLDE\Model\Insights;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE\Rest\InsightsTrack')) {
    class InsightsTrack
    {
        const EVENTS = [
            'view'       => 'views',
            'download'   => 'downloads',
            'fullscreen' => 'fullscreens',
            'share'      => 'shares',
            'dwell'      => 'dwell_ms',
        ];

        const DEDUPE_SECONDS = [
            'view'       => 30 * MINUTE_IN_SECONDS,
            'download'   => 2,
            'fullscreen' => 2,
            'share'      => 2,
        ];

        const MAX_EVENTS       = 20;
        const MAX_PER_MINUTE   = 60;
        const MAX_DWELL_MS     = 30 * MINUTE_IN_SECONDS * 1000;

        public function __construct()
        {
            add_action('rest_api_init', [$this, 'register_routes']);
        }

        /**
         * No nonce, on purpose: a nonce printed into cached HTML expires and silently stops
         * counting. Keys are HMAC-signed instead, so only keys the site issued are accepted.
         */
        public function register_routes()
        {
            register_rest_route('docembedder/v1', '/track', [
                'methods'             => 'POST',
                'callback'            => [$this, 'track'],
                'permission_callback' => '__return_true',
            ]);
        }

        /** Always 204: sendBeacon ignores the response, and a probe learns nothing. */
        public function track(\WP_REST_Request $request)
        {
            $done = new \WP_REST_Response(null, 204);

            $events  = $request->get_param('events');
            $session = (string) $request->get_param('session');

            // Reserved for page-level analytics; validated, never stored in version 1.
            if (!is_array($events) || !$events || !preg_match('/^[a-f0-9]{16,32}$/', $session)) {
                return $done;
            }

            if (!Insights::should_count()) {
                return $done;
            }

            $visitor = Insights::visitor_hash();

            if (Insights::bump('rl_' . substr($visitor, 0, 32), MINUTE_IN_SECONDS) > self::MAX_PER_MINUTE) {
                return $done;
            }

            $pending = [];
            foreach (array_slice($events, 0, self::MAX_EVENTS) as $event) {
                $parsed = $this->parse($event);
                if (!$parsed || !$this->first_of_kind($visitor, $parsed)) {
                    continue;
                }

                list($doc, $column, $amount, $origin) = $parsed;

                $row = isset($pending[$doc]) ? $pending[$doc] : ['counts' => [], 'origin' => 0];
                $row['counts'] = $this->add($row['counts'], $column, $amount);

                if ($column === 'views') {
                    // First view of this document by this visitor today.
                    if (Insights::claim('u_' . Insights::event_key($visitor, $doc, current_time('Y-m-d')), DAY_IN_SECONDS)) {
                        $row['counts'] = $this->add($row['counts'], 'unique_views', 1);
                    }
                }
                $row['origin'] = $origin > 0 ? $origin : $row['origin'];

                $pending[$doc] = $row;
            }

            foreach ($pending as $doc => $row) {
                Insights::record($doc, $row['counts'], $row['origin']);
            }

            return $done;
        }

        /**
         * @return array{0:string,1:string,2:int,3:int}|null doc key, column, amount, origin
         */
        private function parse($event)
        {
            if (!is_array($event)) {
                return null;
            }

            $type = isset($event['type']) ? sanitize_key($event['type']) : '';
            $doc  = isset($event['doc']) ? (string) $event['doc'] : '';
            $sig  = isset($event['sig']) ? (string) $event['sig'] : '';

            if (!isset(self::EVENTS[$type]) || !Insights::verify($doc, $sig)) {
                return null;
            }

            // Saved documents are delivered, and counted, by the download endpoint itself.
            if ($type === 'download' && Insights::doc_post_id($doc) > 0) {
                return null;
            }

            $amount = 1;
            if ($type === 'dwell') {
                $amount = isset($event['value']) ? min(self::MAX_DWELL_MS, max(0, (int) $event['value'])) : 0;
                if ($amount < 1) {
                    return null;
                }
            }

            // Unsigned, so only a real published page is accepted as the host.
            $origin = isset($event['origin']) ? absint($event['origin']) : 0;
            $origin = ($origin && get_post_status($origin) === 'publish') ? $origin : 0;

            return [$doc, self::EVENTS[$type], $amount, $origin];
        }

        private function add(array $counts, $column, $amount)
        {
            $counts[$column] = (isset($counts[$column]) ? $counts[$column] : 0) + $amount;

            return $counts;
        }

        /** Dwell is clamped rather than de-duplicated: it arrives once per flush. */
        private function first_of_kind($visitor, array $parsed)
        {
            $type = array_search($parsed[1], self::EVENTS, true);
            if (!isset(self::DEDUPE_SECONDS[$type])) {
                return true;
            }

            return Insights::claim('e_' . Insights::event_key($visitor, $parsed[0], $type), self::DEDUPE_SECONDS[$type]);
        }
    }
}
