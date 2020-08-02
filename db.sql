--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3
-- Dumped by pg_dump version 12.3

-- Started on 2020-08-01 20:10:02

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 16384)
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- TOC entry 2840 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 206 (class 1259 OID 16424)
-- Name: PromoCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PromoCode" (
    "ID" smallint NOT NULL,
    "PromoCode" text NOT NULL,
    "Description" text NOT NULL
);


ALTER TABLE public."PromoCode" OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 16410)
-- Name: Transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transactions" (
    "ID" bigint NOT NULL,
    "Product" text NOT NULL,
    "Model" text NOT NULL,
    "Date" text NOT NULL,
    "User" text NOT NULL,
    "Price" text NOT NULL,
    "LocalPrice" text NOT NULL,
    "TotalPriceIncludingVAT" text NOT NULL,
    "Number" text NOT NULL,
    "Name" text NOT NULL,
    "ExpDate" text NOT NULL,
    "CVV" text NOT NULL,
    "Memo" text
);


ALTER TABLE public."Transactions" OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 16402)
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    "ID" bigint NOT NULL,
    "Name" text,
    "FamilyName" text,
    "Email" text NOT NULL,
    "PromoCode" text,
    "PhoneNumber" text,
    "Country" text,
    "City" text,
    "Street" text,
    "ZipCode" text,
    "Password" text NOT NULL,
    "Spare1" text,
    "Spare2" text,
    "Spare3" integer,
    "Spare4" integer
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 16420)
-- Name: Users_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Users" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Users_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 2834 (class 0 OID 16424)
-- Dependencies: 206
-- Data for Name: PromoCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."PromoCode" ("ID", "PromoCode", "Description") VALUES (1, '3XCRt', '10% discount');
INSERT INTO public."PromoCode" ("ID", "PromoCode", "Description") VALUES (2, '4DFG', 'My desc.');
INSERT INTO public."PromoCode" ("ID", "PromoCode", "Description") VALUES (3, '6DSQW', 'My new description.');


--
-- TOC entry 2832 (class 0 OID 16410)
-- Dependencies: 204
-- Data for Name: Transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 2831 (class 0 OID 16402)
-- Dependencies: 203
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Users" ("ID", "Name", "FamilyName", "Email", "PromoCode", "PhoneNumber", "Country", "City", "Street", "ZipCode", "Password", "Spare1", "Spare2", "Spare3", "Spare4") OVERRIDING SYSTEM VALUE VALUES (15, 'Arkady', 'Koretsky', 'arkady1992@gmail.com', '3XCRt', NULL, NULL, NULL, NULL, NULL, '$2b$10$TflEzehzZqgor.1eRBayhOmbaMEO480sO8AdkPUVmjwavIjXSqJDG', NULL, NULL, NULL, NULL);


--
-- TOC entry 2841 (class 0 OID 0)
-- Dependencies: 205
-- Name: Users_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_ID_seq"', 15, true);


--
-- TOC entry 2704 (class 2606 OID 16431)
-- Name: PromoCode PromoCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PromoCode"
    ADD CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 2702 (class 2606 OID 16417)
-- Name: Transactions Transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 2700 (class 2606 OID 16409)
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("ID");


-- Completed on 2020-08-01 20:10:04

--
-- PostgreSQL database dump complete
--

