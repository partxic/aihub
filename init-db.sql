DROP TABLE IF EXISTS `users`;

DROP TABLE IF EXISTS `providers`;

DROP TABLE IF EXISTS `unimodels`;

DROP TABLE IF EXISTS `mcps`;

CREATE TABLE
    `users` (
        `name` TEXT PRIMARY KEY NOT NULL,
        `pwd_hash` TEXT NOT NULL,
        `is_admin` INTEGER NOT NULL DEFAULT 0
    );

CREATE TABLE
    `providers` (
        `name` TEXT PRIMARY KEY NOT NULL,
        `base_url` TEXT NOT NULL,
        `api_key` TEXT NOT NULL
    );

CREATE TABLE
    `unimodels` (
        `name` TEXT PRIMARY KEY NOT NULL,
        `models` TEXT NOT NULL
    );

CREATE TABLE
    `mcps` (
        `name` TEXT PRIMARY KEY NOT NULL,
        `url` TEXT NOT NULL,
        `http_header` TEXT NOT NULL
    );

INSERT INTO
    `users` (`name`, `pwd_hash`, `is_admin`)
VALUES
    (
        'admin',
        '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        1
    );