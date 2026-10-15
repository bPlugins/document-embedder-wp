<?php
/**
 * Read-only queries on the download log ({prefix}docembedder_leads).
 *
 * @package DocumentEmbedder
 */

namespace BPLDE\Model;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('BPLDE\Model\LeadsQuery')) {
    class LeadsQuery
    {
        /**
         * Every un-gated download writes a placeholder row with this address (AJAXCall::de_track_download),
         * so the table is a download log first and a lead list second. A "real" lead is any other row,
         * the same rule Insights uses.
         */
        const ANONYMOUS_EMAIL = 'anonymous@direct.download';

        private static function table()
        {
            global $wpdb;

            return $wpdb->prefix . 'docembedder_leads';
        }

        /**
         * WHERE fragment and its values. Days are the site's calendar days, because downloaded_at is
         * written with current_time('mysql'); a range is [from 00:00, day after to 00:00).
         *
         * @param array $filters real_only, document_id, document_ids, from, to, search
         * @return array{0:string,1:array}
         */
        private static function where(array $filters)
        {
            global $wpdb;

            $sql    = ' WHERE 1=1';
            $values = [];

            if (!empty($filters['real_only'])) {
                $sql     .= ' AND email <> %s';
                $values[] = self::ANONYMOUS_EMAIL;
            }
            if (!empty($filters['document_id'])) {
                $sql     .= ' AND document_id = %d';
                $values[] = (int) $filters['document_id'];
            }
            if (isset($filters['document_ids'])) {
                $ids      = array_map('intval', (array) $filters['document_ids']);
                $sql     .= ' AND document_id IN (' . implode(',', array_fill(0, count($ids), '%d')) . ')';
                $values   = array_merge($values, $ids);
            }
            if (!empty($filters['from']) && !empty($filters['to'])) {
                $sql     .= ' AND downloaded_at >= %s AND downloaded_at < %s';
                $values[] = $filters['from'] . ' 00:00:00';
                $values[] = gmdate('Y-m-d', strtotime($filters['to']) + DAY_IN_SECONDS) . ' 00:00:00';
            }
            if (isset($filters['search']) && $filters['search'] !== '') {
                $like     = '%' . $wpdb->esc_like($filters['search']) . '%';
                $sql     .= ' AND (email LIKE %s OR name LIKE %s)';
                $values[] = $like;
                $values[] = $like;
            }

            return [$sql, $values];
        }

        public static function count(array $filters)
        {
            global $wpdb;

            list($where, $values) = self::where($filters);
            $sql = 'SELECT COUNT(*) FROM ' . self::table() . $where;

            if ($values) {
                $sql = $wpdb->prepare($sql, ...$values); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- placeholders built in where()
            }

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- custom table, prepared above
            return (int) $wpdb->get_var($sql);
        }

        /**
         * Rows per document id for a set of ids, in one query.
         *
         * @return array<int,int> document id => rows
         */
        public static function counts_by_document(array $ids, array $filters = [])
        {
            global $wpdb;

            $ids = array_values(array_unique(array_filter(array_map('intval', $ids))));
            if (!$ids) {
                return [];
            }

            $filters['document_ids'] = $ids;
            list($where, $values)    = self::where($filters);

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- custom table, placeholders built in where()
            $rows = $wpdb->get_results($wpdb->prepare('SELECT document_id, COUNT(*) AS total FROM ' . self::table() . $where . ' GROUP BY document_id', ...$values));

            $out = array_fill_keys($ids, 0);
            foreach ((array) $rows as $row) {
                $out[(int) $row->document_id] = (int) $row->total;
            }

            return $out;
        }

        /**
         * A page of real leads. ip_address is deliberately not selected: these rows leave the site
         * (to whichever AI service the site owner connects), and an IP is not needed to act on a lead.
         *
         * @param array $filters document_id, from, to, search
         * @return array[] id, name, email, document_id, document_title, downloaded_at
         */
        public static function find(array $filters, $order, $limit, $offset)
        {
            global $wpdb;

            $filters['real_only'] = true;
            list($where, $values) = self::where($filters);
            $direction            = $order === 'oldest' ? 'ASC' : 'DESC';

            $values[] = (int) $limit;
            $values[] = (int) $offset;

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- custom table, placeholders built in where(), direction is a literal
            return (array) $wpdb->get_results($wpdb->prepare(
                'SELECT id, name, email, document_id, document_title, downloaded_at FROM ' . self::table() . $where
                    . " ORDER BY downloaded_at {$direction}, id {$direction} LIMIT %d OFFSET %d",
                ...$values
            ), ARRAY_A);
        }
    }
}
