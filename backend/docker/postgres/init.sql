CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE SCHEMA IF NOT EXISTS vameo;

GRANT ALL PRIVILEGES ON SCHEMA vameo TO vameo_user;

ALTER USER vameo_user SET search_path TO vameo, public;
