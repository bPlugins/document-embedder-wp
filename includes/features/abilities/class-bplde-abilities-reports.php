<?php
/**
 * AI Agent Access: leads and today's Insights.
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Abilities;

use BPLDE\Model\Insights;
use BPLDE\Model\InsightsReader as Reader;
use BPLDE\Model\LeadsQuery;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE\Abilities\AbilitiesReports')) {
    class AbilitiesReports
    {
        const MAX_TOP = 50;

        /** Called from Abilities::register_abilities(), which has already checked the master switch. */
        public static function register_abilities()
        {
            if (Abilities::leads_enabled()) {
                Abilities::register('list-leads', [
                    'label'               => __('List leads', 'document-emberdder'),
                    'description'         => __('Lists email leads captured by email-gated downloads: name, email, document and capture time (site timezone), newest first. Anonymous un-gated download rows are excluded and IP addresses are never returned. Filter by document_id, date range (max 366 days) or a name/email search. Max 100 per page. For counts only, use get-download-stats.', 'document-emberdder'),
                    'input_schema'        => self::list_leads_input(),
                    'output_schema'       => self::list_leads_output(),
                    'execute_callback'    => [__CLASS__, 'list_leads'],
                    'permission_callback' => [Abilities::class, 'can_manage_options'],
                ]);
            }

            if (self::insights_available()) {
                Abilities::register('get-insights', [
                    'label'               => __('Get insights', 'document-emberdder'),
                    'description'         => __('Today\'s Document Insights (site timezone). view=summary: views, downloads, leads, conversion_rate = leads/views as 0-1, time on screen; top_documents: today\'s busiest documents. daily_unique_views_avg is today\'s unique viewers. Earlier days, date ranges, daily series and top pages need Document Embedder Pro; for downloads in a past date range use get-download-stats.', 'document-emberdder'),
                    'input_schema'        => self::insights_input(),
                    'output_schema'       => self::insights_output(),
                    'execute_callback'    => [__CLASS__, 'get_insights'],
                    'permission_callback' => [Abilities::class, 'can_manage_options'],
                ]);
            }
        }

        private static function insights_available()
        {
            return class_exists('\BPLDE\Model\InsightsReader')
                && class_exists('\BPLDE\Model\Insights')
                && method_exists('\BPLDE\Model\InsightsReader', 'summary')
                && method_exists('\BPLDE\Model\InsightsReader', 'documents');
        }

        /* ---------------------------------------------------------------------------------
         * list-leads
         * ------------------------------------------------------------------------------ */

        public static function list_leads($input = null)
        {
            $input = Abilities::input($input);
            $range = Abilities::date_range($input);

            if (is_wp_error($range)) {
                return $range;
            }

            $page     = Abilities::int_arg($input, 'page', 1, 1, PHP_INT_MAX);
            $per_page = Abilities::int_arg($input, 'per_page', 25, 1, Abilities::MAX_PER_PAGE);
            $filters  = [
                'document_id' => absint(Abilities::arg($input, 'document_id', 0)),
                'search'      => Abilities::text_arg($input, 'search'),
                'from'        => $range ? $range[0] : '',
                'to'          => $range ? $range[1] : '',
            ];

            $total = LeadsQuery::count($filters + ['real_only' => true]);
            $rows  = $total ? LeadsQuery::find($filters, Abilities::enum_arg($input, 'order', ['newest', 'oldest'], 'newest'), $per_page, ($page - 1) * $per_page) : [];

            return Abilities::page(self::lead_items($rows), $total, $page, $per_page);
        }

        /**
         * An external-URL email gate files its leads under the page the block sits on, so a
         * document_id is only reported when it really is a saved document.
         */
        private static function lead_items(array $rows)
        {
            _prime_post_caches(array_map('intval', wp_list_pluck($rows, 'document_id')), false, false);

            $out = [];
            foreach ($rows as $row) {
                $document_id = (int) $row['document_id'];
                $out[]       = [
                    'id'             => (int) $row['id'],
                    'name'           => Abilities::text($row['name']),
                    'email'          => Abilities::text($row['email']),
                    'document_id'    => get_post_type($document_id) === 'ppt_viewer' ? $document_id : 0,
                    'document_title' => Abilities::text($row['document_title']),
                    'captured_at'    => Abilities::iso($row['downloaded_at']),
                ];
            }

            return $out;
        }

        private static function list_leads_input()
        {
            return Abilities::object_input(array_merge(
                [
                    'document_id' => Abilities::document_id_input(__('Only leads filed under this id.', 'document-emberdder')),
                    'search'      => ['type' => 'string', 'maxLength' => 200, 'description' => __('Part of a name or email address.', 'document-emberdder')],
                    'order'       => ['type' => 'string', 'enum' => ['newest', 'oldest'], 'default' => 'newest'],
                ],
                Abilities::date_input(),
                Abilities::paging_input(25)
            ));
        }

        private static function list_leads_output()
        {
            return Abilities::paged_output([
                'type'       => 'object',
                'properties' => [
                    'id'             => ['type' => 'integer'],
                    'name'           => ['type' => 'string'],
                    'email'          => ['type' => 'string'],
                    'document_id'    => ['type' => 'integer', 'description' => __('0 when the lead was filed under a page rather than a saved document.', 'document-emberdder')],
                    'document_title' => ['type' => 'string'],
                    'captured_at'    => Abilities::nullable('string'),
                ],
            ]);
        }

        /* ---------------------------------------------------------------------------------
         * get-insights: today only, the same figures as the free Insights screen
         * ------------------------------------------------------------------------------ */

        public static function get_insights($input = null)
        {
            $input = Abilities::input($input);
            $doc   = self::doc_key($input);

            if (is_wp_error($doc)) {
                return $doc;
            }

            $today = Reader::today();
            $view  = Abilities::enum_arg($input, 'view', ['summary', 'top_documents'], 'summary');
            $limit = Abilities::int_arg($input, 'limit', 10, 1, self::MAX_TOP);
            $since = Reader::first_day($view === 'top_documents' ? '' : $doc);

            $out = [
                'view'             => $view,
                'range'            => ['from' => $today, 'to' => $today],
                'doc_key'          => $doc !== '' ? $doc : null,
                'tracking_since'   => $since,
                'tracking_enabled' => Insights::tracking_enabled(),
                'notes'            => self::insights_notes($since, $view, $doc),
            ];

            if ($view === 'top_documents') {
                return array_merge($out, self::ranked(array_map([__CLASS__, 'document_row'], Reader::documents($today, $today, $limit)), $limit));
            }

            return array_merge($out, ['summary' => self::summary_row(Reader::summary($today, $today, $doc))]);
        }

        /** @return string|\WP_Error a doc key, or '' for every document */
        private static function doc_key(array $input)
        {
            $document_id = absint(Abilities::arg($input, 'document_id', 0));
            $key         = Abilities::text_arg($input, 'doc_key');

            if ($document_id && $key !== '') {
                return Abilities::error('bplde_invalid_input', __('Pass document_id or doc_key, not both.', 'document-emberdder'), 400);
            }
            if ($document_id) {
                if (get_post_type($document_id) !== 'ppt_viewer') {
                    return Abilities::error('bplde_not_found', __('No document exists with that id.', 'document-emberdder'), 404);
                }
                return 'p:' . $document_id;
            }
            if ($key !== '' && !Insights::is_doc_key($key)) {
                return Abilities::error('bplde_not_found', __('Unknown doc_key.', 'document-emberdder'), 404);
            }

            return $key;
        }

        private static function insights_notes($since, $view, $doc)
        {
            $notes = [__('The free version reports today only. Earlier days are recorded and become readable with Document Embedder Pro.', 'document-emberdder')];

            if (!$since) {
                $notes[] = __('No Insights data has been recorded yet for this scope.', 'document-emberdder');
            }
            if (!Insights::tracking_enabled()) {
                $notes[] = __('Insights tracking is switched off in settings, so no new views are being recorded.', 'document-emberdder');
            }
            if ($view === 'top_documents' && $doc !== '') {
                $notes[] = __('top_documents ranks every document; document_id and doc_key are ignored for this view.', 'document-emberdder');
            }

            return $notes;
        }

        private static function ranked(array $rows, $limit)
        {
            foreach ($rows as $i => $row) {
                $rows[$i] = ['rank' => $i + 1] + $row;
            }

            return Abilities::page($rows, count($rows), 1, $limit);
        }

        private static function rate($leads, $views)
        {
            return ($leads !== null && $views) ? round($leads / $views, 4) : null;
        }

        private static function seconds($ms)
        {
            return round($ms / 1000, 1);
        }

        private static function summary_row(array $s)
        {
            return [
                'from'                       => $s['from'],
                'to'                         => $s['to'],
                'days'                       => (int) $s['days'],
                'views'                      => (int) $s['views'],
                'daily_unique_views_avg'     => (float) $s['uniqueDaily'],
                'downloads'                  => (int) $s['downloads'],
                'leads'                      => $s['leads'] === null ? null : (int) $s['leads'],
                'conversion_rate'            => self::rate($s['leads'], $s['views']),
                'avg_time_on_screen_seconds' => self::seconds($s['avgDwellMs']),
                'fullscreens'                => (int) $s['fullscreens'],
                'shares'                     => (int) $s['shares'],
            ];
        }

        public static function document_row(array $row)
        {
            return [
                'doc_key'                    => $row['key'],
                'document_id'                => Insights::doc_post_id($row['key']),
                'title'                      => Abilities::text($row['title']),
                'kind'                       => $row['kind'],
                'host_title'                 => Abilities::text($row['hostTitle']),
                'views'                      => (int) $row['views'],
                'daily_unique_views_avg'     => (float) $row['uniqueDaily'],
                'downloads'                  => (int) $row['downloads'],
                'leads'                      => $row['leads'] === null ? null : (int) $row['leads'],
                'conversion_rate'            => self::rate($row['leads'], $row['views']),
                'avg_time_on_screen_seconds' => self::seconds($row['avgDwellMs']),
                'fullscreens'                => (int) $row['fullscreens'],
                'shares'                     => (int) $row['shares'],
            ];
        }

        /** `range` accepts only "today", so an agent asking for history gets a clear schema error. */
        private static function insights_input()
        {
            return Abilities::object_input([
                'range'       => ['type' => 'string', 'enum' => ['today'], 'default' => 'today', 'description' => __('Only today is available in the free version.', 'document-emberdder')],
                'document_id' => Abilities::document_id_input(__('One saved document. Use this or doc_key, not both.', 'document-emberdder')),
                'doc_key'     => ['type' => 'string', 'pattern' => '^(p:[1-9][0-9]{0,18}|u:[0-9a-f]{40})$', 'description' => __('Insights document key from top_documents: p:<id> or u:<sha1>.', 'document-emberdder')],
                'view'        => ['type' => 'string', 'enum' => ['summary', 'top_documents'], 'default' => 'summary'],
                'limit'       => ['type' => 'integer', 'minimum' => 1, 'maximum' => self::MAX_TOP, 'default' => 10, 'description' => __('Rows for top_documents, 1 to 50.', 'document-emberdder')],
            ]);
        }

        private static function insights_output()
        {
            $int  = ['type' => 'integer'];
            $rate = ['type' => ['number', 'null'], 'description' => __('Leads divided by views, 0 to 1. null when there are no views or the document cannot collect leads.', 'document-emberdder')];

            return [
                'type'       => 'object',
                'properties' => [
                    'view'             => ['type' => 'string'],
                    'range'            => ['type' => 'object', 'properties' => ['from' => ['type' => 'string'], 'to' => ['type' => 'string']]],
                    'doc_key'          => Abilities::nullable('string'),
                    'tracking_since'   => Abilities::nullable('string'),
                    'tracking_enabled' => ['type' => 'boolean'],
                    'notes'            => ['type' => 'array', 'items' => ['type' => 'string']],
                    'summary'          => [
                        'type'       => 'object',
                        'properties' => [
                            'from'                       => ['type' => 'string'],
                            'to'                         => ['type' => 'string'],
                            'days'                       => $int,
                            'views'                      => $int,
                            'daily_unique_views_avg'     => ['type' => 'number', 'description' => __('Unique viewers today.', 'document-emberdder')],
                            'downloads'                  => $int,
                            'leads'                      => Abilities::nullable('integer'),
                            'conversion_rate'            => $rate,
                            'avg_time_on_screen_seconds' => ['type' => 'number'],
                            'fullscreens'                => $int,
                            'shares'                     => $int,
                        ],
                    ],
                    'items'            => ['type' => 'array', 'items' => ['type' => 'object'], 'description' => __('Ranked rows for top_documents.', 'document-emberdder')],
                    'total'            => $int,
                    'page'             => $int,
                    'per_page'         => $int,
                    'total_pages'      => $int,
                ],
                'required'   => ['view', 'range', 'tracking_since', 'notes'],
            ];
        }
    }
}
