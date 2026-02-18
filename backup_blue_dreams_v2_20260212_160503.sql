--
-- PostgreSQL database dump
--

\restrict ZdFPziSjlomAIH9rT3oLe0Y1HJf3Xg1TJAVbJKVqRGPXzdfH32wBicGbbLAN6Jl

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AdminUser; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."AdminUser" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AdminUser" OWNER TO coolify;

--
-- Name: AiSettings; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."AiSettings" (
    id text NOT NULL,
    "systemPrompt" text NOT NULL,
    language text DEFAULT 'tr'::text NOT NULL,
    tone text DEFAULT 'friendly'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "apiKey" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "googleSheetId" text
);


ALTER TABLE public."AiSettings" OWNER TO coolify;

--
-- Name: AiTrainingDocument; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."AiTrainingDocument" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    type text NOT NULL,
    filename text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AiTrainingDocument" OWNER TO coolify;

--
-- Name: Amenity; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."Amenity" (
    id text NOT NULL,
    locale text NOT NULL,
    title text NOT NULL,
    description text,
    icon text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Amenity" OWNER TO coolify;

--
-- Name: AnalyticsConfig; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."AnalyticsConfig" (
    id text NOT NULL,
    "gaId" text,
    "gtmId" text,
    "fbPixelId" text,
    "gaApiSecret" text,
    "gaPropertyId" text,
    "gaServiceKey" text,
    "useGaApi" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AnalyticsConfig" OWNER TO coolify;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    sender text NOT NULL,
    content text NOT NULL,
    "isFromAdmin" boolean DEFAULT false NOT NULL,
    metadata text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatMessage" OWNER TO coolify;

--
-- Name: ChatSession; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."ChatSession" (
    id text NOT NULL,
    "customerName" text,
    status text DEFAULT 'active'::text NOT NULL,
    "visitorId" text,
    "visitorInfo" text,
    "isOnline" boolean DEFAULT true NOT NULL,
    "lastActivity" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "adminNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatSession" OWNER TO coolify;

--
-- Name: CtaBar; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."CtaBar" (
    id text NOT NULL,
    title text NOT NULL,
    subtitle text,
    "buttonText" text,
    "buttonUrl" text,
    "backgroundColor" text DEFAULT '#2563eb'::text NOT NULL,
    "textColor" text DEFAULT '#ffffff'::text NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT false NOT NULL,
    "clickCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CtaBar" OWNER TO coolify;

--
-- Name: Dining; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."Dining" (
    id text NOT NULL,
    locale text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    image text NOT NULL,
    images text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Dining" OWNER TO coolify;

--
-- Name: Language; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."Language" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "nativeName" text,
    flag text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Language" OWNER TO coolify;

--
-- Name: Media; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."Media" (
    id text NOT NULL,
    url text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Media" OWNER TO coolify;

--
-- Name: MeetingRoom; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."MeetingRoom" (
    id text NOT NULL,
    locale text NOT NULL,
    title text NOT NULL,
    area text NOT NULL,
    capacity text NOT NULL,
    height text NOT NULL,
    type text NOT NULL,
    image text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MeetingRoom" OWNER TO coolify;

--
-- Name: MenuItem; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."MenuItem" (
    id text NOT NULL,
    locale text NOT NULL,
    label text NOT NULL,
    url text NOT NULL,
    target text DEFAULT '_self'::text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "parentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MenuItem" OWNER TO coolify;

--
-- Name: Page; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."Page" (
    id text NOT NULL,
    slug text NOT NULL,
    locale text NOT NULL,
    title text NOT NULL,
    "metaDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Page" OWNER TO coolify;

--
-- Name: PageView; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."PageView" (
    id text NOT NULL,
    path text NOT NULL,
    locale text DEFAULT 'tr'::text NOT NULL,
    referrer text,
    "userAgent" text,
    country text,
    device text,
    browser text,
    "sessionId" text,
    duration integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PageView" OWNER TO coolify;

--
-- Name: Room; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."Room" (
    id text NOT NULL,
    locale text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    image text NOT NULL,
    size text,
    view text,
    capacity text,
    features text NOT NULL,
    "priceStart" text,
    "whyChoose" text,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Room" OWNER TO coolify;

--
-- Name: SiteSettings; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."SiteSettings" (
    id text NOT NULL,
    locale text NOT NULL,
    "siteName" text DEFAULT 'Blue Dreams Resort'::text NOT NULL,
    logo text,
    favicon text,
    phone text,
    email text,
    address text,
    "socialLinks" text,
    "footerText" text,
    "footerCopyright" text,
    "headerStyle" text DEFAULT 'default'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SiteSettings" OWNER TO coolify;

--
-- Name: VisitorAction; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."VisitorAction" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "actionType" text NOT NULL,
    payload text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VisitorAction" OWNER TO coolify;

--
-- Name: Widget; Type: TABLE; Schema: public; Owner: coolify
--

CREATE TABLE public."Widget" (
    id text NOT NULL,
    type text NOT NULL,
    data text NOT NULL,
    "order" integer NOT NULL,
    "pageId" text NOT NULL
);


ALTER TABLE public."Widget" OWNER TO coolify;

--
-- Data for Name: AdminUser; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."AdminUser" (id, email, password, name, role, "isActive", "lastLogin", "createdAt", "updatedAt") FROM stdin;
57699fa1-f5fa-4730-b569-1fc8a3665ddb	admin@bluedreamsresort.com	$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy	Super Admin	superadmin	t	\N	2026-02-09 16:35:37.81	2026-02-09 16:35:37.81
d893567a-9175-49ff-a812-a952d88c1bc4	sserdarb@gmail.com	Tuba@2015Tuana	Serdar	superadmin	t	\N	2026-02-10 10:24:06.771	2026-02-10 10:24:06.771
99af90a5-25ff-4331-a40e-60d4c8d825c6	ahmet@pmapartner.com	$2b$10$FDQo0200t4aimyCPh3fPwuVG/4BWVG6zZg0Xbqtzmyo6NdB/GHWq.	Ahmet Pandır	admin	t	\N	2026-02-12 10:01:20.302	2026-02-12 10:01:20.302
\.


--
-- Data for Name: AiSettings; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."AiSettings" (id, "systemPrompt", language, tone, "isActive", "apiKey", "createdAt", "updatedAt", "googleSheetId") FROM stdin;
d0c601e6-86e7-4824-b8d0-1de180f61b9a	Sen Blue Dreams Resort'un dijital konsiyerjisin.\nKİMLİK VE TON:\n- Sofistike, çok bilgili, misafirperver ve çözüm odaklısın.\n- "Satış yap" modundan önce "Bilgi Ver ve Etkile" modundasın.\n\nKURALLAR:\n- Cevapların detaylı ve betimleyici olsun.\n- Kullanıcı bir oda, restoran veya hizmet hakkında bilgi isterse, ilgili UI Widget'ını render et ('render_ui' fonksiyonunu kullan).\n- Fiyat sorulursa 'check_room_availability' kullan.	tr	friendly	t	AIzaSyDzSP67iaCmFwpZyYG0khTILFmPNgYGENc	2026-02-11 11:28:40.108	2026-02-11 11:28:40.108	\N
\.


--
-- Data for Name: AiTrainingDocument; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."AiTrainingDocument" (id, title, content, type, filename, "createdAt") FROM stdin;
\.


--
-- Data for Name: Amenity; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."Amenity" (id, locale, title, description, icon, "order", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AnalyticsConfig; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."AnalyticsConfig" (id, "gaId", "gtmId", "fbPixelId", "gaApiSecret", "gaPropertyId", "gaServiceKey", "useGaApi", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."ChatMessage" (id, "sessionId", sender, content, "isFromAdmin", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: ChatSession; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."ChatSession" (id, "customerName", status, "visitorId", "visitorInfo", "isOnline", "lastActivity", "adminNote", "createdAt") FROM stdin;
\.


--
-- Data for Name: CtaBar; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."CtaBar" (id, title, subtitle, "buttonText", "buttonUrl", "backgroundColor", "textColor", "startDate", "endDate", "isActive", "clickCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Dining; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."Dining" (id, locale, title, type, description, image, images, "order", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Language; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."Language" (id, code, name, "nativeName", flag, "isActive", "isDefault", "order", "createdAt") FROM stdin;
61e2bf82-87d3-48a3-8420-03cc1671231e	tr	Türkçe	Türkçe	🇹🇷	t	t	0	2026-02-09 16:35:37.805
48bb0a93-cb50-4b23-8e59-b57f684bdd2b	en	English	English	🇺🇸	t	f	0	2026-02-09 16:35:37.807
dbe785f5-db73-4139-ab71-20cc3cc8dfb0	de	Deutsch	Deutsch	🇩🇪	t	f	0	2026-02-09 16:35:37.807
b1a23678-60f6-4f2b-9c08-d200fae9a4d7	ru	Russian	Русский	🇷🇺	t	f	0	2026-02-09 16:35:37.808
\.


--
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."Media" (id, url, name, type, "createdAt") FROM stdin;
\.


--
-- Data for Name: MeetingRoom; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."MeetingRoom" (id, locale, title, area, capacity, height, type, image, "order", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."MenuItem" (id, locale, label, url, target, "order", "parentId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Page; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."Page" (id, slug, locale, title, "metaDescription", "createdAt", "updatedAt") FROM stdin;
1a848cb6-bb91-4434-93aa-1c9d80036ba9	odalar/club	tr	Club Odalar	Club Odalar - Blue Dreams Resort	2026-02-09 16:35:37.777	2026-02-09 16:35:37.777
fec3d245-2e03-4d99-92db-0416ab566dc5	yeme-icme	tr	Restoranlar	Restoranlar - Blue Dreams Resort	2026-02-09 16:35:37.778	2026-02-09 16:35:37.778
248850b9-fdfc-4b33-98fe-c58dc9e666a7	rooms	en	Rooms	Rooms - Blue Dreams Resort	2026-02-09 16:35:37.786	2026-02-09 16:35:37.786
b8fd675c-e9f0-4464-8cd2-4fa505e0430b	rooms/club	en	Club Rooms	Club Rooms - Blue Dreams Resort	2026-02-09 16:35:37.788	2026-02-09 16:35:37.788
9f16885b-7ab3-4a15-a849-3420861c796b	food-drink	en	Food & Drink	Food & Drink - Blue Dreams Resort	2026-02-09 16:35:37.789	2026-02-09 16:35:37.789
fccd6cb9-b1a4-4575-a001-1cbf0db3c80e	spa-wellness	en	Spa & Wellness	Spa & Wellness - Blue Dreams Resort	2026-02-09 16:35:37.791	2026-02-09 16:35:37.791
1c083ac2-5990-4dcf-8f57-07247b0f9e1f	gallery	en	Gallery	Gallery - Blue Dreams Resort	2026-02-09 16:35:37.792	2026-02-09 16:35:37.792
d35e6125-db67-40ff-a767-95c30798dfb8	contact-us	en	Contact	Contact - Blue Dreams Resort	2026-02-09 16:35:37.794	2026-02-09 16:35:37.794
611b9f85-6c19-41f4-a701-ece099c4eaf4	zimmer	de	Zimmer	Zimmer - Blue Dreams Resort	2026-02-09 16:35:37.798	2026-02-09 16:35:37.798
3cb1a109-7518-4b8d-80bb-79b740219f25	zimmer/club	de	Club Zimmer	Club Zimmer - Blue Dreams Resort	2026-02-09 16:35:37.799	2026-02-09 16:35:37.799
5baeb14e-d88d-4566-86e1-efb88ffc2e47	essen-trinken	de	Essen & Trinken	Essen & Trinken - Blue Dreams Resort	2026-02-09 16:35:37.801	2026-02-09 16:35:37.801
13292073-2226-4f3c-ac70-270bf8673c91	rooms	ru	Rooms	Rooms - Blue Dreams Resort	2026-02-09 16:35:37.804	2026-02-09 16:35:37.804
aa824782-cbbf-4f5f-86a1-369ba0b6a780	hakkimizda	tr	Hakkımızda	\N	2026-02-10 10:24:06.846	2026-02-12 11:57:39.086
f12164af-1e1c-4f83-baf9-1ce43d92ddf3	hakkimizda	en	About Us	\N	2026-02-10 10:24:06.852	2026-02-12 11:57:39.092
c4964c90-0eb3-4f45-93e3-92f9b0149acf	hakkimizda	de	Über Uns	\N	2026-02-10 10:24:06.859	2026-02-12 11:57:39.098
26cff4d5-3c5c-4987-9a9e-ff82308dc8ae	restoran	tr	Restoran	\N	2026-02-10 10:24:06.894	2026-02-12 11:57:39.13
49728faf-e6d4-4a90-8aff-62cd9ce8fc5f	iletisim	tr	İletişim	İletişim - Blue Dreams Resort	2026-02-09 16:35:37.783	2026-02-12 11:57:39.178
2fbd7be2-a0b0-467d-8a2b-fe79496f46ab	galeri	tr	Galeri	Galeri - Blue Dreams Resort	2026-02-09 16:35:37.781	2026-02-12 11:57:39.231
1fe42cac-1805-4bd2-80d8-1af610694be9	bodrum	tr	Bodrum Rehberi	\N	2026-02-10 10:24:07.039	2026-02-12 11:57:39.271
c42c28d7-80d3-4cfd-852a-c3f98517c462	bodrum	en	Bodrum Guide	\N	2026-02-10 10:24:07.043	2026-02-12 11:57:39.276
9280737d-c581-40c7-af1a-ac93d222713d	bodrum	de	Bodrum Reiseführer	\N	2026-02-10 10:24:07.047	2026-02-12 11:57:39.282
ee5c8546-0a25-4468-b8fa-bb95d6758f75	home	tr	Ana Sayfa	Blue Dreams Resort - Blue Dreams Resort	2026-02-09 16:35:37.764	2026-02-12 11:57:39.024
cb468b22-d3f4-4933-81c6-8124542bcd0f	hakkimizda	ru	О нас	\N	2026-02-10 10:24:06.865	2026-02-12 11:57:39.105
dabb9c29-189b-43e1-b23a-cc9c6e7e3527	odalar	tr	Odalar	Odalar - Blue Dreams Resort	2026-02-09 16:35:37.775	2026-02-12 11:57:39.11
8e64d8d4-616f-4ac5-b5ac-57f0b44521b0	restoran	en	Restaurant	\N	2026-02-10 10:24:06.9	2026-02-12 11:57:39.135
58c82806-503c-41b4-9798-4503cfc9b563	restoran	de	Restaurant	\N	2026-02-10 10:24:06.906	2026-02-12 11:57:39.14
12c8012a-6f92-4435-b706-0a0d0cb8b891	restoran	ru	Ресторан	\N	2026-02-10 10:24:06.911	2026-02-12 11:57:39.145
d40aa3d8-1a09-4243-ae53-3fdc5e4b89c5	iletisim	en	Contact	\N	2026-02-10 10:24:06.953	2026-02-12 11:57:39.184
96676306-d534-4cd8-b649-220f3f1eafd2	iletisim	de	Kontakt	\N	2026-02-10 10:24:06.958	2026-02-12 11:57:39.19
0f0b9914-5924-4166-bbdc-6f5abf57eeec	iletisim	ru	Контакты	\N	2026-02-10 10:24:06.963	2026-02-12 11:57:39.195
ac40af4c-3596-4e32-a514-bbb27f2e387c	dugun-davet	tr	Düğün & Davet	\N	2026-02-10 10:24:06.968	2026-02-12 11:57:39.2
afd41806-0f06-48d6-8ef3-1465f65fce23	galeri	en	Gallery	\N	2026-02-10 10:24:07.007	2026-02-12 11:57:39.234
6e5c75d2-1d29-4866-9f8d-b6bce7bcd9f5	galeri	de	Galerie	\N	2026-02-10 10:24:07.011	2026-02-12 11:57:39.238
094f5791-d243-4d10-ac39-c093c466ed3e	galeri	ru	Галерея	\N	2026-02-10 10:24:07.015	2026-02-12 11:57:39.242
ce5c2d37-cd90-4d66-b5cb-437d58d0d688	bodrum	ru	Путеводитель	\N	2026-02-10 10:24:07.052	2026-02-12 11:57:39.287
7b07db55-70f7-4a56-bfc7-cac327f07c75	home	en	Home	Blue Dreams Resort - Blue Dreams Resort	2026-02-09 16:35:37.785	2026-02-12 11:57:39.05
bb686e0e-e804-4580-8efe-c40edd236b18	spa	tr	Spa & Wellness	Spa & Wellness - Blue Dreams Resort	2026-02-09 16:35:37.78	2026-02-12 11:57:39.15
ba18a248-ecf5-4b43-84c4-273190989c55	dugun-davet	en	Wedding & Events	\N	2026-02-10 10:24:06.975	2026-02-12 11:57:39.208
37a15bf4-78b3-48bf-b5f5-21328262ddf5	toplanti-salonu	tr	Toplantı Salonu	\N	2026-02-10 10:24:07.019	2026-02-12 11:57:39.247
29b25d00-b8cc-441b-aa06-a4f729a9d486	dugun-davet	de	Hochzeit & Events	\N	2026-02-10 10:24:06.983	2026-02-12 11:57:39.216
f5126d06-0a98-4293-8d64-4851d1414e99	toplanti-salonu	en	Meeting Rooms	\N	2026-02-10 10:24:07.024	2026-02-12 11:57:39.253
b218da34-5c82-47e6-b2c6-2cd5d26ccc53	toplanti-salonu	de	Tagungsräume	\N	2026-02-10 10:24:07.029	2026-02-12 11:57:39.258
915a3bf4-c53e-4850-842d-9395c5070ce1	toplanti-salonu	ru	Конференц-залы	\N	2026-02-10 10:24:07.034	2026-02-12 11:57:39.264
eb54ef7f-123c-4c09-97ae-f09e8907e080	home	de	Startseite	Blue Dreams Resort - Blue Dreams Resort	2026-02-09 16:35:37.795	2026-02-12 11:57:39.061
18e62055-813c-46be-b90c-4170da82b4f1	home	ru	Главная	Blue Dreams Resort - Blue Dreams Resort	2026-02-09 16:35:37.802	2026-02-12 11:57:39.074
1cafbb8f-d29b-495b-b447-b43dbd13bd0d	odalar	en	Rooms	\N	2026-02-10 10:24:06.878	2026-02-12 11:57:39.115
3f5b167c-ef06-4595-98e6-656f6d53b9a0	spa	en	Spa & Wellness	\N	2026-02-10 10:24:06.926	2026-02-12 11:57:39.156
f1551ae8-279e-4c07-b7aa-46516593bd4f	spa	de	Spa & Wellness	\N	2026-02-10 10:24:06.933	2026-02-12 11:57:39.163
8131988e-8670-4c72-b569-a84dc6228770	spa	ru	Спа и Велнес	\N	2026-02-10 10:24:06.941	2026-02-12 11:57:39.17
f974de11-f909-41ec-b338-be781d63422c	odalar	de	Zimmer	\N	2026-02-10 10:24:06.884	2026-02-12 11:57:39.12
bb29ac56-0bd9-4994-a016-4c1abff57e7a	dugun-davet	ru	Свадьба и Мероприятия	\N	2026-02-10 10:24:06.991	2026-02-12 11:57:39.223
6d393b8a-6d3e-4327-8132-397368b31698	odalar	ru	Номера	\N	2026-02-10 10:24:06.889	2026-02-12 11:57:39.125
\.


--
-- Data for Name: PageView; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."PageView" (id, path, locale, referrer, "userAgent", country, device, browser, "sessionId", duration, "createdAt") FROM stdin;
e9f55c3d-f203-4a6d-b071-2932017b8d62	/tr	tr	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/138.0.7204.23 Safari/537.36	\N	desktop	Chrome	9ad17ab8-30d6-4f59-bc23-097216540ccb	0	2026-02-09 23:17:08.522
c02ed74c-1448-4ea4-a068-32f24fb3dc1b	/tr	tr	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	79710d0e-2cc5-4dec-9b7d-7dce329fdfa0	0	2026-02-10 05:25:19.993
0e70198b-0d44-40e3-89a8-0760cec09d08	/tr/spa	tr	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	63e944e5-c84e-40b3-a42c-907d6c1d341d	0	2026-02-10 05:27:11.81
e4b46b4f-e4d9-4d3c-9e90-17a252a95eec	/tr/restoran	tr	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	d0bd541d-1343-46af-bf57-6a0c8ad5d184	0	2026-02-10 05:33:11.16
2fd0a8c6-92a9-4196-9f58-7ab2547a5d2e	/tr	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	e0a47d52-de16-4db5-9dae-041d2f5af98c	2	2026-02-10 05:34:17.273
8faa256f-e997-4d84-a158-0fd80137d423	/tr	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	e0a47d52-de16-4db5-9dae-041d2f5af98c	3	2026-02-10 05:34:19.411
af956abf-596c-4e1c-8e64-f2e36b1acdcc	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	e0a47d52-de16-4db5-9dae-041d2f5af98c	2	2026-02-10 05:34:22.791
e493fe62-f3e4-4246-bde4-fb901c9e9c6c	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	e0a47d52-de16-4db5-9dae-041d2f5af98c	1	2026-02-10 05:34:24.871
ac7c9402-ad77-43f9-90b7-d8435d825c80	/tr/odalar	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	e0a47d52-de16-4db5-9dae-041d2f5af98c	2	2026-02-10 05:34:26.405
844ad71b-bf1e-49d7-8704-d49ab7dafef2	/tr/odalar	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)	\N	mobile	Chrome	16e573b0-f4eb-4a38-9660-2582343792e0	0	2026-02-10 05:34:28.681
9cf31003-fb0e-4cb2-a81a-ad3c763205d7	/tr	tr	https://new.bluedreamsresort.com/tr/odalar	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	e0a47d52-de16-4db5-9dae-041d2f5af98c	313	2026-02-10 05:34:28.485
577504bd-ac1d-4949-b3e4-87bb2a8df661	/tr/galeri	tr	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	89164243-33f6-4a25-a2ee-6c7554afd49d	0	2026-02-10 06:09:27.074
2d458c24-ef88-4bd5-8ac5-7eef489984ae	/tr/galeri	tr	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	37ca4909-dbc6-45a0-93c9-d2f5b033440b	0	2026-02-10 06:25:42.573
b7f80219-e5d8-4183-8af9-3b10f70d00ec	/en	en	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	\N	desktop	Safari	0ee2576f-a3d1-4ccb-b064-cc7feb8ac836	26	2026-02-10 08:52:02.161
386186e1-1209-4b8d-8f3c-c32bedad99e2	/tr	tr	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1	\N	mobile	Safari	091f45a0-5d74-4a9d-9b55-a6195cfa7989	2	2026-02-10 08:58:20.822
bc8bc7c7-3e35-4a86-8549-936ad44ac71d	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f3f90715-66af-47c4-a0c5-614655b5493a	4	2026-02-10 10:21:09.333
c7dc75de-582c-484c-a9b8-1c383e40f0ed	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f3f90715-66af-47c4-a0c5-614655b5493a	4	2026-02-10 10:21:14.22
e9dc2c42-3347-44c7-94c4-e35d813029d6	/tr/restoran	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f3f90715-66af-47c4-a0c5-614655b5493a	3	2026-02-10 10:21:18.155
d5670c0e-cba6-427b-9388-024ded6cecdc	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr/restoran	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f3f90715-66af-47c4-a0c5-614655b5493a	2	2026-02-10 10:21:21.175
7f9c1827-2c27-425e-8289-dd98bf1b714c	/tr	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f3f90715-66af-47c4-a0c5-614655b5493a	100	2026-02-10 10:21:23.275
68e32347-8945-4fbd-a857-68cee4ee1ade	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	\N	desktop	Edge	fec87cf4-05e2-4b59-86e2-f6f12c6d035c	113	2026-02-10 10:25:47.792
7120dba2-031d-46a3-ac08-fa01be98d6f1	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	41f7f055-8694-4d9b-8441-abfe4aa372e6	20	2026-02-10 11:41:18.416
ee18a3ba-21fc-42ae-a801-094cb202d762	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	41f7f055-8694-4d9b-8441-abfe4aa372e6	3	2026-02-10 11:41:38.378
ddf07204-c35c-4659-882d-15fe96ea7ed2	/tr	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	41f7f055-8694-4d9b-8441-abfe4aa372e6	105	2026-02-10 11:41:41.644
dc6a1615-3c36-4adf-9fe3-9d655065f43f	/tr/bodrum	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	41f7f055-8694-4d9b-8441-abfe4aa372e6	8	2026-02-10 11:43:26.406
ca2b36d8-4fb9-46eb-a0c2-b8cd32bc288d	/tr	tr	https://new.bluedreamsresort.com/tr/bodrum	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	41f7f055-8694-4d9b-8441-abfe4aa372e6	19	2026-02-10 11:43:34.423
9ef5bf5d-6a0b-4625-b5d6-21cf5a423cde	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	\N	desktop	Edge	291baebe-a013-4553-b33e-1f9896af754b	135	2026-02-10 11:42:12.031
9c046bd2-22cc-48e9-a90f-905613c573af	/en	en	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	\N	desktop	Safari	0ee2576f-a3d1-4ccb-b064-cc7feb8ac836	19863	2026-02-10 08:52:28.394
b11e5321-3421-41ec-a3f4-0ef32f071dea	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	\N	desktop	Edge	291baebe-a013-4553-b33e-1f9896af754b	166	2026-02-10 11:45:12.873
58fe2e99-3b69-4d97-ab40-c5ee874d811f	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	\N	desktop	Edge	291baebe-a013-4553-b33e-1f9896af754b	4	2026-02-10 11:47:59.152
419c763d-df7d-4273-bb58-d2b8f63aeb57	/tr	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	\N	desktop	Edge	291baebe-a013-4553-b33e-1f9896af754b	0	2026-02-10 11:48:03.09
fb75aadf-845c-45f7-b20d-a64ccc754e5b	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	23	2026-02-10 11:48:30.385
51a5795d-6306-4319-917b-ccbd28c9373b	/tr/iletisim	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	4	2026-02-10 11:48:53.908
7b305a9e-6f77-462e-bcaa-0172d18d3a3e	/tr	tr	https://new.bluedreamsresort.com/tr/iletisim	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	0	2026-02-10 11:48:58.525
e7ce074a-cc0e-407e-81fb-ac4ca65b0994	/en	en	https://new.bluedreamsresort.com/tr/iletisim	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	0	2026-02-10 11:49:25.605
97398857-92b5-4034-b23a-bfd9293217d2	/de	de	https://new.bluedreamsresort.com/tr/iletisim	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	0	2026-02-10 11:49:27.059
0e513355-81b1-45c3-ad20-9fc5f927fe7b	/ru	ru	https://new.bluedreamsresort.com/tr/iletisim	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	0	2026-02-10 11:49:29.241
69358bf2-65d0-408c-b74d-3566b061d157	/ru	ru	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	\N	desktop	Edge	291baebe-a013-4553-b33e-1f9896af754b	0	2026-02-10 11:49:30.836
aae95210-770a-4891-ad22-694622a3fd01	/tr	tr	https://new.bluedreamsresort.com/tr/iletisim	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	0	2026-02-10 11:49:34.402
c26949d5-415c-44c9-8e76-d5a098ca3a3e	/en	en	https://new.bluedreamsresort.com/tr/iletisim	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	0	2026-02-10 11:49:35.699
a7541622-36f4-4ec1-b27a-d732002eb5df	/de	de	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	\N	desktop	Edge	291baebe-a013-4553-b33e-1f9896af754b	0	2026-02-10 11:49:54.152
e8a1c6e1-5c8f-413b-8cb7-c1745c8a13c0	/en	en	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	\N	desktop	Edge	291baebe-a013-4553-b33e-1f9896af754b	0	2026-02-10 11:49:57.351
c7784aa9-0b15-4c08-9a08-0b8e16c5f4ca	/tr	tr	https://new.bluedreamsresort.com/tr/iletisim	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	53	2026-02-10 11:49:36.826
fd172692-14c6-4ec8-80e3-12bd4552c84f	/tr/odalar	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	5	2026-02-10 11:50:30.687
ca218319-89f6-4a1c-8f3a-b17e737977e8	/tr	tr	https://new.bluedreamsresort.com/tr/odalar	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	2	2026-02-10 11:50:36.445
e0c29cce-d170-4a44-b3f3-5d5276b0d6a5	/tr/spa	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	11	2026-02-10 11:50:39.028
6cb8c37d-0da8-4b2f-8aeb-2825187b5bb5	/tr/restoran	tr	https://new.bluedreamsresort.com/tr/spa	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	9	2026-02-10 11:50:50.763
c3f77d71-ce9c-45ee-ac7f-7ccedd031bf7	/tr	tr	https://new.bluedreamsresort.com/tr/restoran	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	67	2026-02-10 11:50:59.444
86da3bd5-ebd2-4aaa-8bb4-5499761f627b	/tr	tr	https://new.bluedreamsresort.com/tr/restoran	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	050b5365-110b-4a76-b2c5-87e62b821e57	0	2026-02-10 11:52:07.046
43e037a2-ae88-4052-bc5b-4803e2de0e47	/tr	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	\N	desktop	Edge	291baebe-a013-4553-b33e-1f9896af754b	320	2026-02-10 11:49:58.999
973dd570-cdfc-41e6-916d-cd8b3306b385	/en	en	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f6c81983-9f34-40c4-afa7-771d6a93287f	133	2026-02-10 13:21:42.434
877a7253-c2a3-4037-93da-8ba5cdccdd0c	/en/restoran	en	https://new.bluedreamsresort.com/en	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f6c81983-9f34-40c4-afa7-771d6a93287f	242	2026-02-10 13:23:56.166
0a7962fb-d66d-4388-8126-acde75e0b003	/en/galeri	en	https://new.bluedreamsresort.com/en/restoran	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f6c81983-9f34-40c4-afa7-771d6a93287f	34	2026-02-10 13:27:58.186
67fff197-004d-411f-81af-681e593cfb1d	/en/dugun-davet	en	https://new.bluedreamsresort.com/en/galeri	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f6c81983-9f34-40c4-afa7-771d6a93287f	41	2026-02-10 13:28:32.499
e454fd1c-245b-40e8-803a-eb9629a4edc2	/en	en	https://new.bluedreamsresort.com/en/dugun-davet	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f6c81983-9f34-40c4-afa7-771d6a93287f	0	2026-02-10 13:29:13.756
96b66a36-9191-4a48-83dd-fcfbb3384176	/en	en	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	\N	desktop	Safari	0ee2576f-a3d1-4ccb-b064-cc7feb8ac836	0	2026-02-10 14:23:31.919
4ee14601-49bf-4fd1-9588-044c8f7ec3bb	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	2fc16a12-9793-4827-8981-27d70b6c462e	3	2026-02-10 15:11:18.144
c07a9f95-d32a-4399-8bf2-9525cceaf195	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	2fc16a12-9793-4827-8981-27d70b6c462e	6	2026-02-10 15:11:21.835
566c2752-a137-4a10-8ce2-745d34029216	/tr/spa	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	2fc16a12-9793-4827-8981-27d70b6c462e	5	2026-02-10 15:11:27.772
b7dc1f93-3b5f-4f16-af7e-ce0730e49354	/tr/toplanti-salonu	tr	https://new.bluedreamsresort.com/tr/spa	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	2fc16a12-9793-4827-8981-27d70b6c462e	3	2026-02-10 15:11:33.398
3439db18-8050-470f-ae69-68396d5a5e5d	/tr/galeri	tr	https://new.bluedreamsresort.com/tr/toplanti-salonu	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	2fc16a12-9793-4827-8981-27d70b6c462e	0	2026-02-10 15:11:36.665
8a54609b-e2c0-4977-b1c2-1339fff8d356	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f040b111-4d3a-4fb9-b5bb-4ed1ad1e1d62	2	2026-02-11 10:04:00.817
11ed583b-296c-4826-9c66-cb4008eabe5f	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f040b111-4d3a-4fb9-b5bb-4ed1ad1e1d62	9	2026-02-11 10:04:02.919
f53627cc-a61a-41bc-b8e8-e232f2eb3c2a	/tr/toplanti-salonu	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	f040b111-4d3a-4fb9-b5bb-4ed1ad1e1d62	9	2026-02-11 10:04:11.705
a8010900-4695-4c64-8134-74ac18568e9c	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	02fc67e3-420a-468f-b6a5-560efa890553	57	2026-02-11 11:23:24.595
c2a10cc1-2c39-449e-9f42-f59db9b5a4f7	/tr/toplanti-salonu	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	02fc67e3-420a-468f-b6a5-560efa890553	0	2026-02-11 11:24:22.11
38f3cca9-168e-4267-abf1-22217f9d12a3	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	57eb79fc-7a65-4592-8008-8b1950eb399c	5	2026-02-11 12:06:19.083
d5ed82fd-50f7-4d89-8dd4-dfa8829fa6f0	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	16d314e7-3a17-4387-806d-5e9bd8f543dd	55	2026-02-11 12:11:06.303
f1bc31da-eddb-4c02-acf0-377dd0624ec2	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	16d314e7-3a17-4387-806d-5e9bd8f543dd	27	2026-02-11 12:12:27.559
56e913d8-87fe-48f2-9096-af107754e164	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	9d36667e-3b47-4501-a5e5-9176eb99bd7e	25	2026-02-11 12:19:51.352
e288fe25-f0d0-4542-bdcf-ae70a539e6bd	/tr	tr	https://new.bluedreamsresort.com/tr/admin/ai	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	12a092da-9cd1-439a-9efc-35429bb94f9c	0	2026-02-11 12:42:30.36
fd7c3fc9-d31c-4332-b498-5c2d2f310f29	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	16d314e7-3a17-4387-806d-5e9bd8f543dd	0	2026-02-11 12:43:05.102
daec0204-45f6-4bfc-a03e-585015f4e158	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	52	2026-02-11 13:25:23.332
3d16a555-9fba-4cf8-b3a9-aff0a4fa1012	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	0	2026-02-11 13:26:16.125
3574a003-cb55-4b78-90fe-277c879cf512	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	ddc94cf0-5656-4921-a0f3-481674dae5cd	85	2026-02-11 13:26:19.41
82a7a540-3cbe-45b4-a190-49d0ab661dbc	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	ddc94cf0-5656-4921-a0f3-481674dae5cd	40	2026-02-11 13:28:02.563
e236e6e1-4da9-4a07-bb9c-583b338c0517	/tr/bodrum	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	ddc94cf0-5656-4921-a0f3-481674dae5cd	38	2026-02-11 13:28:44.406
0d186a59-d3df-4253-9955-69e0724ae051	/tr	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	ddc94cf0-5656-4921-a0f3-481674dae5cd	69	2026-02-11 13:29:22.531
de1bd27c-bf2f-4e60-a7ed-b5cbb14fcdf7	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	ddc94cf0-5656-4921-a0f3-481674dae5cd	62	2026-02-11 13:30:32.073
a48bf09e-8ad0-4c58-86c7-43d61cb7e574	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	38e49eb2-0bac-4faa-b757-96b052f57a1d	79103	2026-02-11 11:31:07.383
2990ca11-5952-4b5f-b52f-bb0ba92a7d8d	/ru	ru	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	0	2026-02-11 13:33:21.615
d991e264-fbee-4b86-b55c-ae1f7b8fb7ee	/de	de	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	0	2026-02-11 13:33:24.125
f3cb458e-a9f6-41ca-a4e8-5e85c43978a5	/en	en	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	0	2026-02-11 13:33:26.475
143cdab7-8eee-41f2-815e-fda3c6c21903	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	211	2026-02-11 13:33:28.64
3817000e-3e69-44a0-8079-f2b8028cadb8	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	ddc94cf0-5656-4921-a0f3-481674dae5cd	1135	2026-02-11 13:40:42.195
86124606-d032-4017-8c32-5bb71172e306	/tr	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	97	2026-02-11 13:37:00.571
50d8a00a-fbf5-453b-ae12-884b15c7a62f	/tr/bodrum	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	16	2026-02-11 13:38:39.667
b3ec18cc-b5ee-4ba0-b4c8-a4048b7e620d	/tr	tr	https://new.bluedreamsresort.com/tr/bodrum	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	51	2026-02-11 13:38:55.522
f814d1ec-dc70-4922-a3e4-949c225eb3f6	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	10	2026-02-11 13:39:48.784
fcdfce80-2b46-4b4d-8ab0-249422a7640f	/tr	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	ddc94cf0-5656-4921-a0f3-481674dae5cd	547	2026-02-11 13:31:34.174
5953f1b3-5f67-4481-820b-152b88f524c5	/tr	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	76	2026-02-11 13:40:00.523
15165e26-e06a-4d46-a677-af78cbfc555b	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	9	2026-02-11 13:41:16.932
6d87971d-5273-4432-801e-0f5d3ce78565	/tr	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	203	2026-02-11 13:41:26.064
da8c0fda-1b38-4cf0-ba88-2f3a16fc6721	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	17	2026-02-11 13:44:50.675
7a6930f3-5c64-44b3-a191-f362f83f1d0b	/en	en	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	\N	desktop	Safari	0ee2576f-a3d1-4ccb-b064-cc7feb8ac836	0	2026-02-11 14:11:48.694
89e696b1-1058-497b-8648-efc37557f689	/tr	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	c1662f65-77b2-4e9a-b4a5-4f756de1cc38	25	2026-02-11 15:45:16.619
5b0492f0-1718-4b39-865c-c7db3fc544a7	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	\N	desktop	Edge	971abd3f-e032-4273-8217-53cef097c09e	15	2026-02-11 15:51:11.098
30976fc5-5da0-45b4-bd9a-181e3f344744	/ru	ru	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	8c6c9de9-c4e5-4c13-b33c-76f671d9759b	0	2026-02-11 16:55:58.046
ce7d69a9-3145-487c-8e31-704b1e27eee2	/en/hakkimizda	en	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	6ceb2c5d-ef05-4575-97a3-a6bdd3415525	0	2026-02-11 17:06:51.131
4e5969ea-08df-4ad9-9c91-955d2138bb81	/en	en	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	36ce06fb-4c7d-489e-8094-a885b4910585	0	2026-02-11 17:11:54.386
1e0a7e39-7c2e-4ab6-a753-e75abc86154c	/de	de	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	abae977e-591c-4bf9-9fad-75327eb2988f	0	2026-02-11 17:17:08.369
4b4d5e57-e1e3-4dc0-af1b-23b95527d303	/tr	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	13529	2026-02-11 13:45:08.325
fec9643e-e8c4-4efa-82e3-476f54d576bb	/tr	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	4863c3f8-d957-4f73-a1f4-05024764121e	8	2026-02-11 19:15:35.909
aa977ec1-8b9a-42c5-ac90-1b7f0e32a757	/tr	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	fad439b4-031e-4bf1-99cf-af514092ed92	7942	2026-02-11 17:30:37.414
4e7420fd-d366-4d5d-bf5f-79168c742dba	/tr	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	04e6dd50-581f-420c-85cf-be04b3491951	18	2026-02-11 20:33:23.048
3d21187a-7f66-469c-a3bb-011a08d64d60	/tr/odalar	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	04e6dd50-581f-420c-85cf-be04b3491951	12	2026-02-11 20:33:41.615
6cd09209-62db-4b24-82a6-e25a6ec22a08	/tr/restoran	tr	https://new.bluedreamsresort.com/tr/odalar	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	04e6dd50-581f-420c-85cf-be04b3491951	6	2026-02-11 20:33:54.171
8a917dfb-9a15-49f0-9c27-d4eac3f0c29b	/tr/odalar	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	04e6dd50-581f-420c-85cf-be04b3491951	6	2026-02-11 20:34:00.227
a440f96b-d8af-4b9c-bc34-2a12e590aa5a	/tr/bodrum	tr	https://new.bluedreamsresort.com/tr/odalar	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	04e6dd50-581f-420c-85cf-be04b3491951	10	2026-02-11 20:34:05.953
4beea95f-58b7-4a8f-9182-6833e1135717	/tr/bodrum	tr	https://new.bluedreamsresort.com/tr/odalar	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	04e6dd50-581f-420c-85cf-be04b3491951	8	2026-02-11 20:35:55.217
e565a0b1-ba6d-475b-9dfb-2574eaf89f19	/tr	tr	https://new.bluedreamsresort.com/tr/bodrum	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	04e6dd50-581f-420c-85cf-be04b3491951	1472	2026-02-11 20:36:03.529
3f2d5c40-2fb7-4f77-9655-5152dbfe9a17	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	ef37ea3f-77a2-4323-8141-dcfefee46625	65	2026-02-11 22:07:31.281
e3738b38-db06-4b72-9802-b4cc37b639eb	/tr	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	02ec4c27-9e3f-43de-85de-0a2e9f2d7334	3	2026-02-12 05:15:27.527
df611afd-67df-4b2a-9784-c39c24ac26b6	/tr/hakkimizda	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	02ec4c27-9e3f-43de-85de-0a2e9f2d7334	1	2026-02-12 05:15:30.555
f3321270-c410-4250-b77b-8eebf9aa82dd	/tr/odalar	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)	\N	mobile	Chrome	f5738e8c-03ba-42dd-b37d-4b064c0f1c27	0	2026-02-12 05:15:34.182
9b5f6e94-c048-4b19-b84a-1a47d092e4bf	/tr/odalar	tr	https://new.bluedreamsresort.com/tr/hakkimizda	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	02ec4c27-9e3f-43de-85de-0a2e9f2d7334	4	2026-02-12 05:15:32.051
4c4089e5-f5a2-4d82-951c-8fb44f49c34f	/tr	tr	https://new.bluedreamsresort.com/tr/odalar	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	02ec4c27-9e3f-43de-85de-0a2e9f2d7334	4	2026-02-12 05:15:36.414
f5696b19-fabc-4a43-8089-7887bdb311ce	/tr/odalar	tr	https://new.bluedreamsresort.com/tr	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	02ec4c27-9e3f-43de-85de-0a2e9f2d7334	4	2026-02-12 05:15:40.176
5f43b5e5-b76c-4cc7-a6cd-5bf4b7415c15	/tr/iletisim	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)	\N	mobile	Chrome	f2cfd119-ff86-45f5-8d71-bbc4f52125db	0	2026-02-12 05:15:46.407
16bdf22e-6ad3-4656-af2b-e24f627210af	/tr/iletisim	tr	https://new.bluedreamsresort.com/tr/odalar	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	02ec4c27-9e3f-43de-85de-0a2e9f2d7334	15	2026-02-12 05:15:44.78
094e0bd6-4e3b-4f24-9543-5b414daeffa2	/tr	tr	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	8358595b-de48-417a-971d-3220319fc4db	0	2026-02-12 06:48:32.198
2c229192-edca-4192-abf1-28a06065a38e	/tr/hakkimizda	tr	\N	AdsBot-Google (+http://www.google.com/adsbot.html)	\N	mobile	Chrome	58822e5c-db05-407b-8a7a-17c2ee63b816	0	2026-02-12 06:50:30.013
c739af05-8ea0-4991-9fd5-8971f31bc23f	/tr	tr	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1	\N	mobile	Safari	0b677dbf-95d0-4080-9a34-35d994f145f4	4	2026-02-12 07:08:10.923
93053d44-bc2e-4723-835f-8b3894f1403e	/tr	tr	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1	\N	mobile	Safari	374eb36b-421a-4529-92f8-2e1e659111d1	0	2026-02-12 07:08:36.675
c99e66dd-dd3c-4182-aebc-1867b6b5fc7d	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	c4f6477f-f7cf-4547-9982-a6619eb4f6d1	91	2026-02-12 09:16:31.751
76340f38-6629-4107-b59b-116813c16bb5	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	964bf310-b49a-4efb-ab83-6aa39a69ba01	13	2026-02-12 09:53:42.624
88b6829e-a84b-42d0-8f26-e6845b7aa5f4	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	964bf310-b49a-4efb-ab83-6aa39a69ba01	14	2026-02-12 09:54:10.159
60798b12-004c-423b-8419-e48eee6d2804	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	964bf310-b49a-4efb-ab83-6aa39a69ba01	14	2026-02-12 09:54:36.694
e26b0542-8474-4667-a0ee-898bc74ba82c	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	964bf310-b49a-4efb-ab83-6aa39a69ba01	61	2026-02-12 09:54:58.762
74ea3233-fdc4-4964-8201-789644926da4	/en	en	https://statics.teams.cdn.office.net/	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	1afa6d78-97da-43db-9289-3de2434a4038	4	2026-02-12 10:05:37.403
ab509b32-f625-47da-92b6-4459a7ab9f56	/en	en	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	\N	desktop	Safari	dc2f576a-c198-47f9-943a-cd95a5f67284	0	2026-02-12 10:32:46.948
a2537758-2c65-4dbc-9147-ca20dd5a55e8	/en	en	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	\N	desktop	Safari	dc2f576a-c198-47f9-943a-cd95a5f67284	7	2026-02-12 10:34:25.497
899e3a3b-06ee-48e1-a60d-544e89d50cd0	/en/toplanti-salonu	en	https://new.bluedreamsresort.com/en	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	\N	desktop	Safari	dc2f576a-c198-47f9-943a-cd95a5f67284	10	2026-02-12 10:34:32.763
b10eff49-6d4e-4a47-bb32-b07ea4c124c4	/en/hakkimizda	en	https://new.bluedreamsresort.com/en/toplanti-salonu	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	\N	desktop	Safari	dc2f576a-c198-47f9-943a-cd95a5f67284	5	2026-02-12 10:34:43.429
c6bca712-b310-4249-8316-9d4ea446b052	/tr	tr	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	\N	mobile	Chrome	89ff835b-ff71-4880-bdfd-ec0d3cca5742	8	2026-02-12 12:05:44.955
12a3ccd5-1b48-4d1d-8046-11216f48e229	/en	en	https://new.bluedreamsresort.com/en/admin	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	\N	desktop	Safari	6ba16caf-b501-4d3c-831d-ee5caeb0d436	2	2026-02-12 12:06:48.832
61de8e37-068b-46d7-833d-d4007f86f6f9	/en	en	https://new.bluedreamsresort.com/en/hakkimizda	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	\N	desktop	Safari	dc2f576a-c198-47f9-943a-cd95a5f67284	7301	2026-02-12 10:34:49.109
760405db-65d1-4b70-879b-3e4fbd2e6bf7	/tr	tr	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	\N	desktop	Chrome	a68dbe3f-b726-4f41-9bb9-793c24f51388	69	2026-02-12 12:57:06.937
\.


--
-- Data for Name: Room; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."Room" (id, locale, title, description, image, size, view, capacity, features, "priceStart", "whyChoose", "order", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."SiteSettings" (id, locale, "siteName", logo, favicon, phone, email, address, "socialLinks", "footerText", "footerCopyright", "headerStyle", "createdAt", "updatedAt") FROM stdin;
a0c67dcf-afa9-4c62-b7c2-bc3847f9a9ef	tr	Blue Dreams Resort	\N	\N	\N	\N	\N	\N	\N	\N	default	2026-02-09 16:35:37.808	2026-02-09 16:35:37.808
2db560db-a899-4d71-ac26-c939f5dadba8	en	Blue Dreams Resort	\N	\N	+90 252 337 11 11	sales@bluedreamsresort.com	Torba Mahallesi Herodot Bulvarı No:11 Bodrum / MUĞLA / TÜRKİYE	\N	\N	\N	default	2026-02-12 10:30:54.159	2026-02-12 10:30:54.159
\.


--
-- Data for Name: VisitorAction; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."VisitorAction" (id, "sessionId", "actionType", payload, "createdAt") FROM stdin;
\.


--
-- Data for Name: Widget; Type: TABLE DATA; Schema: public; Owner: coolify
--

COPY public."Widget" (id, type, data, "order", "pageId") FROM stdin;
89c092b2-4f43-4ffa-8e4a-38a0e0922fff	hero	{"badge":"Bodrum'un İncisi","titleLine1":"Ege'nin Mavi","titleLine2":"Rüyası","subtitle":"Doğanın kalbinde, lüksün ve huzurun buluştuğu nokta. Evinize, Blue Dreams'e hoş geldiniz.","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","scrollText":"Keşfet","buttons":[{"text":"Odaları Keşfet","url":"/tr/odalar","style":"primary"},{"text":"Tanıtım Filmi","url":"https://youtu.be/Et5yM-tW7_0","style":"outline","external":true}]}	1	ee5c8546-0a25-4468-b8fa-bb95d6758f75
17c344fe-f5be-47f5-8eed-7937153d2d86	about-statement	{"label":"Blue Dreams Deneyimi","headingParts":[{"text":"Ege'nin kıyısında "},{"text":"sizin yeriniz","accent":true},{"text":", mevsimlerin ritmiyle hazırlanan "},{"text":"eşsiz lezzetler","accent":true},{"text":" ve bizim hikayemizin "},{"text":"sizin hikayenizle","accent":true},{"text":" buluştuğu nokta."}]}	2	ee5c8546-0a25-4468-b8fa-bb95d6758f75
587c591c-37bb-4bd7-9145-eec297f674c5	category-cards	{"cards":[{"title":"ODALAR","subtitle":"Bodrum'un kalbinde tasarım odalar","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg","href":"/odalar"},{"title":"RESTORAN & BAR","subtitle":"Gerçek bir gastronomi deneyimi","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg","href":"/restoran"},{"title":"AKTİVİTELER","subtitle":"Size özel anlar ve eğlence","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/WATER-SPORTS-.jpg","href":"/spa"}]}	3	ee5c8546-0a25-4468-b8fa-bb95d6758f75
b10f89e5-e778-4245-bb3d-29de77329a03	experience-blocks	{"blocks":[{"label":"Doğa & Konfor","h1":"Doğa ile","h2":"bütünleşin","text":"Torba'nın çam ormanlarıyla kaplı tepelerinde, Ege'nin turkuaz sularına nazır bir konum. Müstakil girişli odalarımız ve doğal mimarimiz ile kalabalıktan uzak, kendinizle baş başa kalabileceğiniz özel bir yaşam alanı sunuyoruz.","buttonText":"Odaları Keşfet","buttonUrl":"/odalar","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","bgColor":"sand","buttonColor":"gold","reverse":false},{"label":"Gastronomi","h1":"Taze. Yerel.","h2":"Sürdürülebilir.","text":"Blue Dreams mutfağında her tabak bir hikaye anlatır. Yerel üreticilerden temin edilen taze Ege otları, günlük deniz ürünleri ve ödüllü şeflerimizin modern yorumlarıyla hazırlanan A la Carte restoranlarımızda gerçek bir lezzet yolculuğuna çıkın.","buttonText":"Lezzetleri Tat","buttonUrl":"/restoran","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","detailImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","bgColor":"white","buttonColor":"orange","reverse":true},{"label":"İyi Hisset","h1":"Rahatla. Yenilen.","h2":"Keyfini Çıkar.","text":"Sonsuzluk havuzumuzda gün batımını izlerken veya Spa merkezimizin dingin atmosferinde ruhunuzu dinlendirirken zamanın yavaşladığını hissedeceksiniz. Türk hamamı ritüelleri ve masaj terapileri ile kendinizi şımartın.","buttonText":"Spa & Wellness","buttonUrl":"/spa","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","bgColor":"cream","buttonColor":"brand","reverse":false}]}	4	ee5c8546-0a25-4468-b8fa-bb95d6758f75
aaed5c30-eebb-4984-be14-2341d74661d3	HeroSection	{"title": "Club Odalar", "subtitle": "Do\\u011fa ile \\u0130\\u00e7 \\u0130\\u00e7e", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Club+Odalar"}	0	1a848cb6-bb91-4434-93aa-1c9d80036ba9
59e5ef9d-a7f0-4914-b8ab-f64f9e50631b	TextBlock	{"content": "<h2>Club Odalar</h2><p>Ye\\u015fillikler i\\u00e7inde, \\u00f6zel balkonlu ve deniz manzaral\\u0131 club odalar\\u0131m\\u0131z.</p>"}	1	1a848cb6-bb91-4434-93aa-1c9d80036ba9
2ad0f516-8e1d-4a6d-b60a-c095719b1f76	HeroSection	{"title": "Lezzet Yolculu\\u011fu", "subtitle": "D\\u00fcnya Mutfaklar\\u0131ndan Se\\u00e7meler", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Lezzet+Yolculu\\u011fu"}	0	fec3d245-2e03-4d99-92db-0416ab566dc5
6e0d4b9d-fff9-4ba8-b7ed-c5eb44ed8d83	TextBlock	{"content": "<h2>Restoranlar</h2><p>Ana restoran\\u0131m\\u0131z ve A'la Carte restoranlar\\u0131m\\u0131zda e\\u015fsiz lezzetleri ke\\u015ffedin.</p>"}	1	fec3d245-2e03-4d99-92db-0416ab566dc5
590ce77c-1961-4889-b5bc-695464601dd9	HeroSection	{"title": "Accommodation", "subtitle": "Comfort & Luxury", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Accommodation"}	0	248850b9-fdfc-4b33-98fe-c58dc9e666a7
ebe90328-a8a0-4384-885f-79ff6c4cec2a	TextBlock	{"content": "<h2>Rooms</h2><p>Experience an unforgettable holiday in our modern and stylishly designed rooms.</p>"}	1	248850b9-fdfc-4b33-98fe-c58dc9e666a7
f4f1cd84-d6d3-4014-875c-399f7bc1cd0c	HeroSection	{"title": "Club Rooms", "subtitle": "Nature & Peace", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Club+Rooms"}	0	b8fd675c-e9f0-4464-8cd2-4fa505e0430b
ac539f84-99d9-409c-b9c5-de6a62f20a5b	TextBlock	{"content": "<h2>Club Rooms</h2><p>Our club rooms featuring private balconies and sea views, nestled in greenery.</p>"}	1	b8fd675c-e9f0-4464-8cd2-4fa505e0430b
2077cc6c-8f56-40da-bc4d-73ff5b4ed214	HeroSection	{"title": "Culinary Journey", "subtitle": "World Cuisines", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Culinary+Journey"}	0	9f16885b-7ab3-4a15-a849-3420861c796b
b0381dd4-e0e9-4d2c-9479-2ff5bb512693	TextBlock	{"content": "<h2>Food & Drink</h2><p>Discover unique tastes in our main restaurant and A'la Carte restaurants.</p>"}	1	9f16885b-7ab3-4a15-a849-3420861c796b
e628a339-203b-45bd-b0cb-9ebef4ef88e6	HeroSection	{"title": "Rejuvenate Your Soul", "subtitle": "Spa & Massage Services", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Rejuvenate+Your+Soul"}	0	fccd6cb9-b1a4-4575-a001-1cbf0db3c80e
4605d421-1bb1-4e3e-820f-dda0be6b01a7	TextBlock	{"content": "<h2>Spa & Wellness</h2><p>Relieve the tiredness of the day with our expert therapists.</p>"}	1	fccd6cb9-b1a4-4575-a001-1cbf0db3c80e
13ef2853-7ef7-432e-a547-41cdb36fb693	HeroSection	{"title": "Gallery", "subtitle": "Moments from Blue Dreams", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Gallery"}	0	1c083ac2-5990-4dcf-8f57-07247b0f9e1f
f8685bfd-c651-4b3d-86e0-b9fec756ca4e	TextBlock	{"content": "<h2>Gallery</h2><p>Take a look at the fascinating atmosphere of Blue Dreams Resort.</p>"}	1	1c083ac2-5990-4dcf-8f57-07247b0f9e1f
229b2ab1-d071-41b6-aa81-61ba1c0ee3c4	HeroSection	{"title": "Contact Us", "subtitle": "Get in Touch", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Contact+Us"}	0	d35e6125-db67-40ff-a767-95c30798dfb8
7136f2ca-346c-43df-9498-64c8660d6bd9	TextBlock	{"content": "<h2>Contact</h2><p>Contact us for your questions and reservation requests.</p>"}	1	d35e6125-db67-40ff-a767-95c30798dfb8
827ca3d7-69ab-47e7-ae4a-03e15f3a59f9	HeroSection	{"title": "Unterkunft", "subtitle": "Komfort & Luxus", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Unterkunft"}	0	611b9f85-6c19-41f4-a701-ece099c4eaf4
a65b2ccc-c2d3-4004-8d6a-c170d4a183e0	TextBlock	{"content": "<h2>Zimmer</h2><p>Erleben Sie einen unvergesslichen Urlaub in unseren modern und stilvoll eingerichteten Zimmern.</p>"}	1	611b9f85-6c19-41f4-a701-ece099c4eaf4
a213b288-e450-47ef-a545-d67742c3e64a	HeroSection	{"title": "Club Zimmer", "subtitle": "Natur & Ruhe", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Club+Zimmer"}	0	3cb1a109-7518-4b8d-80bb-79b740219f25
7bcbe95a-02df-41b7-9b4d-211cf804965d	TextBlock	{"content": "<h2>Club Zimmer</h2><p>Unsere Club-Zimmer inmitten von Gr\\u00fcn mit eigenem Balkon und Meerblick.</p>"}	1	3cb1a109-7518-4b8d-80bb-79b740219f25
e714a70c-c7c7-4239-a8b3-97599536794d	HeroSection	{"title": "Kulinarische Reise", "subtitle": "Weltk\\u00fcche", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Kulinarische+Reise"}	0	5baeb14e-d88d-4566-86e1-efb88ffc2e47
632642fc-cf33-4215-8ca0-d49711893b7e	TextBlock	{"content": "<h2>Essen & Trinken</h2><p>Entdecken Sie einzigartige Geschm\\u00e4cker in unserem Hauptrestaurant und den A'la Carte Restaurants.</p>"}	1	5baeb14e-d88d-4566-86e1-efb88ffc2e47
8ca0ee1b-29e1-4e88-bece-4f1f7a6445ba	HeroSection	{"title": "Accommodation", "subtitle": "Comfort & Luxury", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Accommodation"}	0	13292073-2226-4f3c-ac70-270bf8673c91
1843c4e6-1115-4340-8422-259fa86ec4e8	TextBlock	{"content": "<h2>Rooms</h2><p>Experience an unforgettable holiday in our modern and stylishly designed rooms.</p>"}	1	13292073-2226-4f3c-ac70-270bf8673c91
688dd811-0ba7-4465-9afc-ec05b45a1bf9	category-cards	{"cards":[{"title":"ZIMMER","subtitle":"Designerzimmer im Herzen von Bodrum","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg","href":"/odalar"},{"title":"RESTAURANT & BAR","subtitle":"Ein wahres gastronomisches Erlebnis","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg","href":"/restoran"},{"title":"AKTIVITÄTEN","subtitle":"Besondere Momente und Unterhaltung","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/WATER-SPORTS-.jpg","href":"/spa"}]}	3	eb54ef7f-123c-4c09-97ae-f09e8907e080
4f789a60-0136-45f1-9fd4-eacffe409e1c	local-guide	{"badge":"AI Concierge Selection","heading":"Keşfet &","headingAccent":"Deneyimle","description":"Yapay zeka asistanımız Blue Concierge tarafından, ilgi alanlarınıza ve mevsime özel olarak derlenen Bodrum rotaları ve otel içi etkinlik takvimi.","attractionsLabel":"Çevrede Yapılabilecekler","attractionsLinkText":"Tüm Rotaları Gör","attractions":[{"title":"Bodrum Kalesi & Sualtı Müzesi","distance":"10 km","description":"St. John Şövalyeleri tarafından inşa edilen tarihi kale ve dünyanın en önemli sualtı arkeoloji müzelerinden biri.","image":"https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png","tag":"Tarih & Kültür"},{"title":"Yalıkavak Marina","distance":"18 km","description":"Dünya markaları, gurme restoranlar ve lüks yatların buluşma noktası. Alışveriş ve gece hayatının kalbi.","image":"https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png","tag":"Lüks Yaşam"},{"title":"Antik Tiyatro","distance":"9 km","description":"M.Ö. 4. yüzyıldan kalma, Halikarnassos'un görkemli yapısı. Eşsiz Bodrum manzarasına hakim bir konumda.","image":"https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg","tag":"Manzara"}],"eventsLabel":"Yaklaşan Etkinlikler","eventsLinkText":"Takvimi İncele","events":[{"day":"15","month":"TEM","title":"Sunset Jazz Sessions","time":"19:30 - 22:00","location":"Pier Bar","description":"Ege gün batımına karşı saksafon ve kontrbasın büyüleyici uyumu.","icon":"music"},{"day":"16","month":"TEM","title":"Ege Otları & Gastronomi Atölyesi","time":"14:00 - 16:00","location":"La Gondola Garden","description":"Şefimiz ile yerel otları tanıyın ve sağlıklı Ege mezeleri hazırlamayı öğrenin.","icon":"utensils"},{"day":"Her","month":"GÜN","title":"Morning Flow Yoga","time":"08:00 - 09:00","location":"Sonsuzluk Havuzu Terası","description":"Güne zinde başlamak için profesyonel eğitmenler eşliğinde yoga seansı.","icon":"sun"}]}	5	ee5c8546-0a25-4468-b8fa-bb95d6758f75
7f4da812-94e9-4ee8-9c6e-4084153136fe	page-header	{"title":"About Us","subtitle":"The Blue Dreams Resort story","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"About Us","href":"/en/hakkimizda"}]}	1	f12164af-1e1c-4f83-baf9-1ce43d92ddf3
be57c154-1f66-46a1-9612-343a3b7fa05d	text-image	{"label":"Our Story","heading":"25 Years of","headingAccent":"Passion","paragraphs":["Blue Dreams Resort has been welcoming guests in Torba Bay, Bodrum, amidst the unique blue of the Aegean since 1998.","Spread across 55,000 m², our resort offers over 340 rooms, hosting thousands of guests each year.","We offer unforgettable holiday experiences with our philosophy of blending modern comfort with historical texture in harmony with nature."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","imageAlt":"Blue Dreams Resort","badge":{"value":"25+","label":"Years of Experience"}}	2	f12164af-1e1c-4f83-baf9-1ce43d92ddf3
60569ce7-2edf-41c2-a716-c28662360cdf	stats	{"items":[{"icon":"award","value":"5★","label":"Hotel Class"},{"icon":"users","value":"340+","label":"Total Rooms"},{"icon":"calendar","value":"1998","label":"Founded"},{"icon":"mappin","value":"55K","label":"Area (m²)"}]}	3	f12164af-1e1c-4f83-baf9-1ce43d92ddf3
d2d58958-9198-46d6-882b-ab7e2326e299	icon-grid	{"label":"Our Values","heading":"Core Principles","items":[{"icon":"🌊","title":"Naturalness","description":"Living in harmony with Aegean nature"},{"icon":"✨","title":"Excellence","description":"Flawless service in every detail"},{"icon":"🌿","title":"Sustainability","description":"Protecting nature for future generations"}]}	4	f12164af-1e1c-4f83-baf9-1ce43d92ddf3
c00dc883-b2f4-40ec-93e6-7fce1bdc8d67	cta	{"heading":"We Await You","subtitle":"Let us plan your dream vacation together.","backgroundColor":"white","buttons":[{"text":"Contact Us","url":"/en/iletisim","variant":"primary"},{"text":"Online Booking","url":"https://blue-dreams.rezervasyonal.com/","variant":"outline"}]}	5	f12164af-1e1c-4f83-baf9-1ce43d92ddf3
20ab9e5e-9ae0-4af7-83f9-05d71ec911e9	page-header	{"title":"Über Uns","subtitle":"Die Geschichte des Blue Dreams Resort","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"Über Uns","href":"/de/hakkimizda"}]}	1	c4964c90-0eb3-4f45-93e3-92f9b0149acf
c237b174-683f-4b01-a0f0-f270a7f35f4d	text-image	{"label":"Unsere Geschichte","heading":"25 Jahre","headingAccent":"Leidenschaft","paragraphs":["Das Blue Dreams Resort empfängt seit 1998 Gäste in der Bucht von Torba, Bodrum.","Auf 55.000 m² bietet unser Resort über 340 Zimmer.","Wir bieten unvergessliche Urlaubserlebnisse mit unserer Philosophie."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","imageAlt":"Blue Dreams Resort","badge":{"value":"25+","label":"Jahre Erfahrung"}}	2	c4964c90-0eb3-4f45-93e3-92f9b0149acf
0c97c871-b3a4-4670-b1bc-f8f4706c44c2	stats	{"items":[{"icon":"award","value":"5★","label":"Hotelklasse"},{"icon":"users","value":"340+","label":"Zimmeranzahl"},{"icon":"calendar","value":"1998","label":"Gründung"},{"icon":"mappin","value":"55K","label":"Fläche (m²)"}]}	3	c4964c90-0eb3-4f45-93e3-92f9b0149acf
f4a9d923-c3c8-42cf-80e2-b60b4c5e5d34	icon-grid	{"label":"Unsere Werte","heading":"Grundprinzipien","items":[{"icon":"🌊","title":"Natürlichkeit","description":"Leben im Einklang mit der ägäischen Natur"},{"icon":"✨","title":"Exzellenz","description":"Tadelloser Service in jedem Detail"},{"icon":"🌿","title":"Nachhaltigkeit","description":"Schutz der Natur für zukünftige Generationen"}]}	4	c4964c90-0eb3-4f45-93e3-92f9b0149acf
deea87d5-f2a0-4ca9-a99f-79602375214e	cta	{"heading":"Wir erwarten Sie","subtitle":"Planen wir gemeinsam Ihren Traumurlaub.","backgroundColor":"white","buttons":[{"text":"Kontakt","url":"/de/iletisim","variant":"primary"},{"text":"Online Buchung","url":"https://blue-dreams.rezervasyonal.com/","variant":"outline"}]}	5	c4964c90-0eb3-4f45-93e3-92f9b0149acf
0c8050ba-54a2-480a-9657-a692a1c3c28e	page-header	{"title":"О нас","subtitle":"История Blue Dreams Resort","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"О нас","href":"/ru/hakkimizda"}]}	1	cb468b22-d3f4-4933-81c6-8124542bcd0f
24f5db9e-fa60-4194-ae5b-97f3da2fd398	text-image	{"label":"Наша история","heading":"25 лет","headingAccent":"Страсти","paragraphs":["Курорт Blue Dreams с 1998 года принимает гостей в бухте Торба, Бодрум.","На площади 55 000 м² наш курорт предлагает более 340 номеров.","Мы предлагаем незабываемый отдых, сочетая современный комфорт с природой."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","imageAlt":"Blue Dreams Resort","badge":{"value":"25+","label":"Лет опыта"}}	2	cb468b22-d3f4-4933-81c6-8124542bcd0f
ef272067-f0d4-4100-bf59-20cfee3538e5	stats	{"items":[{"icon":"award","value":"5★","label":"Класс отеля"},{"icon":"users","value":"340+","label":"Номера"},{"icon":"calendar","value":"1998","label":"Год основания"},{"icon":"mappin","value":"55K","label":"Площадь (м²)"}]}	3	cb468b22-d3f4-4933-81c6-8124542bcd0f
dc1f7318-83d6-4e74-8b75-43de2970cc93	icon-grid	{"label":"Наши ценности","heading":"Основные принципы","items":[{"icon":"🌊","title":"Естественность","description":"Жизнь в гармонии с природой Эгейского моря"},{"icon":"✨","title":"Превосходство","description":"Безупречный сервис в каждой детали"},{"icon":"🌿","title":"Устойчивость","description":"Защита природы для будущих поколений"}]}	4	cb468b22-d3f4-4933-81c6-8124542bcd0f
87d92a7d-cccc-456b-bb42-db3d38bdcb5c	cta	{"heading":"Мы ждём вас","subtitle":"Давайте вместе спланируем ваш идеальный отпуск.","backgroundColor":"white","buttons":[{"text":"Контакт","url":"/ru/iletisim","variant":"primary"},{"text":"Онлайн бронирование","url":"https://blue-dreams.rezervasyonal.com/","variant":"outline"}]}	5	cb468b22-d3f4-4933-81c6-8124542bcd0f
14fbe9dd-38f0-4dcf-b8c8-0c05620f5f14	page-header	{"title":"Odalar & Süitler","subtitle":"Her bütçeye uygun konfor","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg","breadcrumbs":[{"label":"Odalar","href":"/tr/odalar"}]}	1	dabb9c29-189b-43e1-b23a-cc9c6e7e3527
064d71bf-991d-4968-b3a1-1f3c09d94c6b	text-block	{"label":"Konaklama","heading":"Konfor ve","headingAccent":"Zerafet","content":"340'ı aşkın odamız ile size en uygun konaklama seçeneğini sunuyoruz.","backgroundColor":"white"}	2	dabb9c29-189b-43e1-b23a-cc9c6e7e3527
0607be10-4c94-4b13-91a3-b00655df229f	room-list	{}	3	dabb9c29-189b-43e1-b23a-cc9c6e7e3527
3a091abd-cce6-4900-b441-b1767bb473eb	cta	{"heading":"Hayalinizdeki Odayı Bulun","subtitle":"Online rezervasyon ile en iyi fiyat garantisi","backgroundColor":"dark","buttons":[{"text":"Hemen Rezervasyon Yap","url":"https://blue-dreams.rezervasyonal.com/","variant":"white"}]}	4	dabb9c29-189b-43e1-b23a-cc9c6e7e3527
c041ee0d-36b3-4e8f-9824-4a7e9098563b	page-header	{"title":"Rooms & Suites","subtitle":"Comfort for every budget","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg","breadcrumbs":[{"label":"Rooms","href":"/en/odalar"}]}	1	1cafbb8f-d29b-495b-b447-b43dbd13bd0d
58c38f39-4a05-4bfa-b9d0-fd69a33506df	text-block	{"label":"Accommodation","heading":"Comfort and","headingAccent":"Elegance","content":"With over 340 rooms, we offer the most suitable accommodation option for you.","backgroundColor":"white"}	2	1cafbb8f-d29b-495b-b447-b43dbd13bd0d
959839d1-4657-43b0-bd83-155c77fc3f75	room-list	{}	3	1cafbb8f-d29b-495b-b447-b43dbd13bd0d
a2c9df12-9736-498e-8b88-ef9c08051c25	cta	{"heading":"Find Your Dream Room","subtitle":"Best price guarantee with online booking","backgroundColor":"dark","buttons":[{"text":"Book Now","url":"https://blue-dreams.rezervasyonal.com/","variant":"white"}]}	4	1cafbb8f-d29b-495b-b447-b43dbd13bd0d
30968e7e-3ce7-462f-abe4-7bc690207d80	page-header	{"title":"Zimmer & Suiten","subtitle":"Komfort für jedes Budget","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg","breadcrumbs":[{"label":"Zimmer","href":"/de/odalar"}]}	1	f974de11-f909-41ec-b338-be781d63422c
ce6d61ad-017f-41ff-a565-8c1fe2f0fb0f	text-block	{"label":"Unterkunft","heading":"Komfort und","headingAccent":"Eleganz","content":"Mit über 340 Zimmern bieten wir die passende Unterkunft.","backgroundColor":"white"}	2	f974de11-f909-41ec-b338-be781d63422c
d613caa0-4a9a-4b6b-94c0-c658ebc22a75	room-list	{}	3	f974de11-f909-41ec-b338-be781d63422c
e072aa6c-9e0e-461c-a86c-dbdd25ee6b5d	cta	{"heading":"Finden Sie Ihr Traumzimmer","subtitle":"Bestpreisgarantie bei Online-Buchung","backgroundColor":"dark","buttons":[{"text":"Jetzt Buchen","url":"https://blue-dreams.rezervasyonal.com/","variant":"white"}]}	4	f974de11-f909-41ec-b338-be781d63422c
72a5a4c4-4622-489d-b393-41b3b5753069	page-header	{"title":"Номера и Люксы","subtitle":"Комфорт для любого бюджета","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg","breadcrumbs":[{"label":"Номера","href":"/ru/odalar"}]}	1	6d393b8a-6d3e-4327-8132-397368b31698
0715fc35-98bd-4f32-8067-ccf6fceeb46e	text-block	{"label":"Размещение","heading":"Комфорт и","headingAccent":"Элегантность","content":"Более 340 номеров для вашего идеального отдыха.","backgroundColor":"white"}	2	6d393b8a-6d3e-4327-8132-397368b31698
775e193c-c0f1-4fdf-8d98-0213607f7c65	room-list	{}	3	6d393b8a-6d3e-4327-8132-397368b31698
bf57f138-4aab-49b0-bad9-49addfd59b49	cta	{"heading":"Найдите номер мечты","subtitle":"Лучшая цена при онлайн-бронировании","backgroundColor":"dark","buttons":[{"text":"Забронировать","url":"https://blue-dreams.rezervasyonal.com/","variant":"white"}]}	4	6d393b8a-6d3e-4327-8132-397368b31698
a38819ed-f549-482a-beae-9a9c2ebc1e35	page-header	{"title":"Restoran & Bar","subtitle":"Eşsiz lezzetler","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","breadcrumbs":[{"label":"Restoran","href":"/tr/restoran"}]}	1	26cff4d5-3c5c-4987-9a9e-ff82308dc8ae
c1f96822-779a-4675-b073-83915144d83f	text-block	{"label":"Gastronomi","heading":"Tatlar ve","headingAccent":"Lezzetler","content":"Her damak zevkine hitap eden restoranlarımız ve barlarımız.","backgroundColor":"white"}	2	26cff4d5-3c5c-4987-9a9e-ff82308dc8ae
95a6cc6b-35d6-47b3-be4d-e965890d6d64	image-grid	{"items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","title":"Blue Restaurant","badge":"Ana Restoran","description":"Zengin açık büfe kahvaltı, öğle ve akşam yemekleri","meta":"07:00 - 22:00","meta2":"Dünya Mutfağı"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","title":"Italian A'la Carte","badge":"A'la Carte","description":"Otantik İtalyan lezzetleri ve taze makarnalar","meta":"19:00 - 22:00","meta2":"İtalyan"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Beach Bar","badge":"Bar","description":"Tropikal kokteyller ve hafif atıştırmalıklar","meta":"10:00 - 24:00"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Sunset Bar","badge":"Bar","description":"Gün batımı eşliğinde özel kokteyller","meta":"17:00 - 01:00"}],"variant":"overlay","columns":2}	3	26cff4d5-3c5c-4987-9a9e-ff82308dc8ae
305d5fe9-d865-4ebf-80d3-12c028789a83	cta	{"heading":"Her Şey Dahil","subtitle":"Zengin açık büfe ve a'la carte seçenekleriyle gastronomi deneyimi.","backgroundColor":"dark","buttons":[{"text":"WhatsApp","url":"https://wa.me/902523371111","variant":"white"},{"text":"Odaları Gör","url":"/tr/odalar","variant":"white-outline"}]}	4	26cff4d5-3c5c-4987-9a9e-ff82308dc8ae
e8e4874c-2727-4eba-880f-d8f20cb81415	page-header	{"title":"Restaurant & Bar","subtitle":"Unique flavors","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","breadcrumbs":[{"label":"Restaurant","href":"/en/restoran"}]}	1	8e64d8d4-616f-4ac5-b5ac-57f0b44521b0
9c07c94e-6149-4da8-9c4a-1add7b850018	text-block	{"label":"Gastronomy","heading":"Tastes and","headingAccent":"Flavors","content":"Our restaurants and bars cater to every palate.","backgroundColor":"white"}	2	8e64d8d4-616f-4ac5-b5ac-57f0b44521b0
9c0a64c8-21e4-4f02-9d4f-58918128dfdd	image-grid	{"items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","title":"Blue Restaurant","badge":"Ana Restoran","description":"Zengin açık büfe kahvaltı, öğle ve akşam yemekleri","meta":"07:00 - 22:00","meta2":"Dünya Mutfağı"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","title":"Italian A'la Carte","badge":"A'la Carte","description":"Otantik İtalyan lezzetleri ve taze makarnalar","meta":"19:00 - 22:00","meta2":"İtalyan"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Beach Bar","badge":"Bar","description":"Tropikal kokteyller ve hafif atıştırmalıklar","meta":"10:00 - 24:00"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Sunset Bar","badge":"Bar","description":"Gün batımı eşliğinde özel kokteyller","meta":"17:00 - 01:00"}],"variant":"overlay","columns":2}	3	8e64d8d4-616f-4ac5-b5ac-57f0b44521b0
df5cf8dd-2124-4681-aa77-38dfb7bbe6d2	cta	{"heading":"All Inclusive","subtitle":"Gastronomy experience with rich buffet and a la carte options.","backgroundColor":"dark","buttons":[{"text":"WhatsApp","url":"https://wa.me/902523371111","variant":"white"},{"text":"View Rooms","url":"/en/odalar","variant":"white-outline"}]}	4	8e64d8d4-616f-4ac5-b5ac-57f0b44521b0
22883161-2482-4b62-be24-a471fd475ce2	page-header	{"title":"Restaurant & Bar","subtitle":"Einzigartige Aromen","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","breadcrumbs":[{"label":"Restaurant","href":"/de/restoran"}]}	1	58c82806-503c-41b4-9798-4503cfc9b563
3d29db64-125f-4fbb-aef1-936c7603f1b5	text-block	{"label":"Gastronomie","heading":"Geschmack und","headingAccent":"Aromen","content":"Unsere Restaurants und Bars für jeden Geschmack.","backgroundColor":"white"}	2	58c82806-503c-41b4-9798-4503cfc9b563
f36b0f90-c2ad-4875-85f6-b68af2352731	image-grid	{"items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","title":"Blue Restaurant","badge":"Ana Restoran","description":"Zengin açık büfe kahvaltı, öğle ve akşam yemekleri","meta":"07:00 - 22:00","meta2":"Dünya Mutfağı"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","title":"Italian A'la Carte","badge":"A'la Carte","description":"Otantik İtalyan lezzetleri ve taze makarnalar","meta":"19:00 - 22:00","meta2":"İtalyan"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Beach Bar","badge":"Bar","description":"Tropikal kokteyller ve hafif atıştırmalıklar","meta":"10:00 - 24:00"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Sunset Bar","badge":"Bar","description":"Gün batımı eşliğinde özel kokteyller","meta":"17:00 - 01:00"}],"variant":"overlay","columns":2}	3	58c82806-503c-41b4-9798-4503cfc9b563
dc75706d-97e9-4921-af5a-467ed1871664	cta	{"heading":"All Inclusive","subtitle":"Gastronomie-Erlebnis mit Buffet und A-la-carte.","backgroundColor":"dark","buttons":[{"text":"WhatsApp","url":"https://wa.me/902523371111","variant":"white"},{"text":"Zimmer ansehen","url":"/de/odalar","variant":"white-outline"}]}	4	58c82806-503c-41b4-9798-4503cfc9b563
2b862529-ddc1-4f9d-83a3-86a61d7fe1e1	page-header	{"title":"Ресторан и Бар","subtitle":"Уникальные вкусы","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","breadcrumbs":[{"label":"Ресторан","href":"/ru/restoran"}]}	1	12c8012a-6f92-4435-b706-0a0d0cb8b891
0a737bda-7180-44ff-b457-32bf066cf98b	text-block	{"label":"Гастрономия","heading":"Вкусы и","headingAccent":"Ароматы","content":"Наши рестораны и бары для любого вкуса.","backgroundColor":"white"}	2	12c8012a-6f92-4435-b706-0a0d0cb8b891
7a7b21cf-22f1-477b-a5fd-333f3d1a4c2c	image-grid	{"items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","title":"Blue Restaurant","badge":"Ana Restoran","description":"Zengin açık büfe kahvaltı, öğle ve akşam yemekleri","meta":"07:00 - 22:00","meta2":"Dünya Mutfağı"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","title":"Italian A'la Carte","badge":"A'la Carte","description":"Otantik İtalyan lezzetleri ve taze makarnalar","meta":"19:00 - 22:00","meta2":"İtalyan"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Beach Bar","badge":"Bar","description":"Tropikal kokteyller ve hafif atıştırmalıklar","meta":"10:00 - 24:00"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Sunset Bar","badge":"Bar","description":"Gün batımı eşliğinde özel kokteyller","meta":"17:00 - 01:00"}],"variant":"overlay","columns":2}	3	12c8012a-6f92-4435-b706-0a0d0cb8b891
b2d066e4-e065-4722-a8e6-fb16d84c62c9	cta	{"heading":"Всё включено","subtitle":"Гастрономический опыт с шведским столом и а-ля карт.","backgroundColor":"dark","buttons":[{"text":"WhatsApp","url":"https://wa.me/902523371111","variant":"white"},{"text":"Смотреть номера","url":"/ru/odalar","variant":"white-outline"}]}	4	12c8012a-6f92-4435-b706-0a0d0cb8b891
3c2d66c4-be69-4954-9388-af6de42ee17e	page-header	{"title":"Spa & Wellness","subtitle":"Naya Spa ile huzurun adresi","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","breadcrumbs":[{"label":"Spa","href":"/tr/spa"}]}	1	bb686e0e-e804-4580-8efe-c40edd236b18
c93f0819-259e-4a0b-b397-dbfa225cf33e	text-image	{"label":"Naya Spa","heading":"Beden ve","headingAccent":"Ruh Dengesi","paragraphs":["Naya Spa, antik Anadolu şifa ritüellerinden ilham alan benzersiz masaj ve bakım programları sunar.","Profesyonel terapistlerimiz size özel wellness deneyimi yaratır."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg","imageAlt":"Naya Spa","buttons":[{"text":"Randevu Al","url":"https://wa.me/905495167801","variant":"primary"}]}	2	bb686e0e-e804-4580-8efe-c40edd236b18
876674e4-de21-457b-bbbc-105630a1a706	image-grid	{"label":"Masaj Seçenekleri","heading":"Öne Çıkan Bakımlar","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Bali Masajı","description":"Endonezya kökenli derin doku masajı","meta":"60 dk"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Aromaterapi","description":"Uçucu yağlarla rahatlatıcı masaj","meta":"45 dk"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Hot Stone","description":"Sıcak taş terapi ile derin gevşeme","meta":"60 dk"}],"variant":"card","columns":3}	3	bb686e0e-e804-4580-8efe-c40edd236b18
d9a37a29-0449-4c11-be9f-273d26a6d109	icon-grid	{"heading":"Neden Naya Spa?","backgroundColor":"dark","items":[{"icon":"🌿","title":"Organik Ürünler","description":"Doğal ve organik bakım ürünleri"},{"icon":"💆","title":"Uzman Terapistler","description":"Sertifikalı profesyonel ekip"},{"icon":"🕊️","title":"Huzurlu Atmosfer","description":"Doğa ile iç içe spa ortamı"}]}	4	bb686e0e-e804-4580-8efe-c40edd236b18
349a7688-4746-4538-a2e9-cdeedd47f202	image-grid	{"label":"Tesisler","heading":"Spa Tesislerimiz","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Infinity Pool","description":"Denize sıfır sonsuzluk havuzu"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Özel Plaj","description":"Berrak sulara sahip özel kumsal"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Fitness Center","description":"Modern ekipmanlarla donatılmış salon"}],"variant":"simple","columns":3}	5	bb686e0e-e804-4580-8efe-c40edd236b18
45be53d0-a3b0-41d4-b1b8-f708c0e795b3	cta	{"heading":"Kendinize Bir İyilik Yapın","subtitle":"Naya Spa'da profesyonel bakım ve masaj için randevunuzu alın.","backgroundColor":"gradient","buttons":[{"text":"Randevu Al","url":"https://wa.me/905495167823","variant":"white"},{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"white-outline"}]}	6	bb686e0e-e804-4580-8efe-c40edd236b18
e44c83f4-8367-4d7a-ab1b-d848fb6bebef	page-header	{"title":"Spa & Wellness","subtitle":"Naya Spa — your haven of peace","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","breadcrumbs":[{"label":"Spa","href":"/en/spa"}]}	1	3f5b167c-ef06-4595-98e6-656f6d53b9a0
ff0f3f5f-d0d5-4089-95af-c45bbf06cc51	text-image	{"label":"Naya Spa","heading":"Body and","headingAccent":"Soul Balance","paragraphs":["Naya Spa offers unique massage and care programs inspired by ancient Anatolian healing rituals.","Our professional therapists create a personalized wellness experience."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg","imageAlt":"Naya Spa","buttons":[{"text":"Book Appointment","url":"https://wa.me/905495167801","variant":"primary"}]}	2	3f5b167c-ef06-4595-98e6-656f6d53b9a0
6dff9ab0-e3ca-4392-a1ab-b547b56dbe58	image-grid	{"label":"Massage Options","heading":"Featured Treatments","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Bali Masajı","description":"Endonezya kökenli derin doku masajı","meta":"60 dk"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Aromaterapi","description":"Uçucu yağlarla rahatlatıcı masaj","meta":"45 dk"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Hot Stone","description":"Sıcak taş terapi ile derin gevşeme","meta":"60 dk"}],"variant":"card","columns":3}	3	3f5b167c-ef06-4595-98e6-656f6d53b9a0
0db8c8de-c43a-4a47-a2cc-23eec8517f72	icon-grid	{"heading":"Why Naya Spa?","backgroundColor":"dark","items":[{"icon":"🌿","title":"Organic Products","description":"Natural and organic care products"},{"icon":"💆","title":"Expert Therapists","description":"Certified professional team"},{"icon":"🕊️","title":"Peaceful Atmosphere","description":"Spa environment in harmony with nature"}]}	4	3f5b167c-ef06-4595-98e6-656f6d53b9a0
695b2261-2512-46ab-99cc-eea97c422479	image-grid	{"label":"Facilities","heading":"Our Spa Facilities","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Infinity Pool","description":"Beachfront infinity pool"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Private Beach","description":"Private beach with crystal clear waters"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Fitness Center","description":"Fully equipped modern gym"}],"variant":"simple","columns":3}	5	3f5b167c-ef06-4595-98e6-656f6d53b9a0
e2642304-20ee-41bd-b392-a0caf5c796c7	cta	{"heading":"Treat Yourself","subtitle":"Book your professional care and massage at Naya Spa.","backgroundColor":"gradient","buttons":[{"text":"Book Now","url":"https://wa.me/905495167823","variant":"white"},{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"white-outline"}]}	6	3f5b167c-ef06-4595-98e6-656f6d53b9a0
1a4b4b71-20a5-455a-a9f0-b48f0d6ba52c	page-header	{"title":"Spa & Wellness","subtitle":"Naya Spa — Ihr Ort der Ruhe","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","breadcrumbs":[{"label":"Spa","href":"/de/spa"}]}	1	f1551ae8-279e-4c07-b7aa-46516593bd4f
4c5ccdc3-472b-4ff8-aac4-f7f8b226e922	text-image	{"label":"Naya Spa","heading":"Körper und","headingAccent":"Seele Balance","paragraphs":["Naya Spa bietet einzigartige Massage- und Pflegeprogramme.","Unsere professionellen Therapeuten schaffen ein persönliches Wellness-Erlebnis."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg","imageAlt":"Naya Spa","buttons":[{"text":"Termin buchen","url":"https://wa.me/905495167801","variant":"primary"}]}	2	f1551ae8-279e-4c07-b7aa-46516593bd4f
f9d37832-c419-4095-858d-5aa51928df7c	icon-grid	{"heading":"Warum Naya Spa?","backgroundColor":"dark","items":[{"icon":"🌿","title":"Bio-Produkte","description":"Natürliche und biologische Pflegeprodukte"},{"icon":"💆","title":"Experten-Therapeuten","description":"Zertifiziertes professionelles Team"},{"icon":"🕊️","title":"Friedliche Atmosphäre","description":"Spa-Umgebung im Einklang mit der Natur"}]}	4	f1551ae8-279e-4c07-b7aa-46516593bd4f
9ae27775-bc35-4250-979b-ebab24032f34	image-grid	{"label":"Einrichtungen","heading":"Unsere Spa-Einrichtungen","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Infinity Pool","description":"Infinity-Pool am Strand"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Privatstrand","description":"Privatstrand mit kristallklarem Wasser"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Fitnesscenter","description":"Voll ausgestattetes modernes Fitnessstudio"}],"variant":"simple","columns":3}	5	f1551ae8-279e-4c07-b7aa-46516593bd4f
188d4831-0886-402f-89da-9645877104e9	cta	{"heading":"Gönnen Sie sich etwas","subtitle":"Buchen Sie Ihre professionelle Pflege und Massage im Naya Spa.","backgroundColor":"gradient","buttons":[{"text":"Jetzt Buchen","url":"https://wa.me/905495167823","variant":"white"},{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"white-outline"}]}	6	f1551ae8-279e-4c07-b7aa-46516593bd4f
0fba113e-af15-4044-bbd6-a50044f4cf06	page-header	{"title":"Спа и Велнес","subtitle":"Naya Spa — ваш оазис покоя","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","breadcrumbs":[{"label":"Спа","href":"/ru/spa"}]}	1	8131988e-8670-4c72-b569-a84dc6228770
042888f5-806d-4ce1-8ad7-0a216ed89b86	text-image	{"label":"Naya Spa","heading":"Баланс","headingAccent":"Тела и Души","paragraphs":["Naya Spa предлагает уникальные массажные и оздоровительные программы.","Наши профессиональные терапевты создадут персональный велнес-опыт."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg","imageAlt":"Naya Spa","buttons":[{"text":"Записаться","url":"https://wa.me/905495167801","variant":"primary"}]}	2	8131988e-8670-4c72-b569-a84dc6228770
099dfcf9-b867-46a3-a121-c58262e9737d	map	{"lat":37.091832,"lng":27.4824998,"zoom":15}	3	0f0b9914-5924-4166-bbdc-6f5abf57eeec
b533586c-194e-4739-8094-25193d836a3f	hero	{"backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3-1024x682.jpg","titleLine1":"Düğün & Davet","subtitle":"En özel anlarınız için eşsiz bir atmosfer"}	1	ac40af4c-3596-4e32-a514-bbb27f2e387c
8aceb68c-f976-42b0-86e4-6fe48a782388	text-image	{"heading":"Rüyaların Gerçeğe Dönüştüğü Yer","headingAccent":"Blue Dreams Resort","paragraphs":["Bodrum'un en güzel manzarası ayaklarınızın altında. Denize sıfır konumu, profesyonel ekibi ve büyüleyici atmosferi ile hayallerinizdeki düğünü gerçeğe dönüştürüyoruz."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg","imagePosition":"left","listItems":["Eşsiz Gün Batımı Manzarası","Özel Kokteyl ve Yemek Menüleri","Profesyonel Organizasyon Desteği"]}	2	ac40af4c-3596-4e32-a514-bbb27f2e387c
0cdb640e-0ebf-4081-89af-81116f603dce	youtube	{"videos":[{"url":"https://www.youtube.com/embed/JJc20SjIENQ?controls=1&rel=0","title":"Wedding Video 1"},{"url":"https://www.youtube.com/embed/KDfh1NV2eUc?controls=1&rel=0","title":"Wedding Video 2"}],"columns":2}	3	ac40af4c-3596-4e32-a514-bbb27f2e387c
b5e94523-63c1-4a15-9b98-88bf45c718af	cta	{"heading":"Profesyonel Organizasyon Ekibi","subtitle":"Hayalinizdeki geceyi en ince ayrıntısına kadar planlıyoruz.","backgroundColor":"brand"}	4	ac40af4c-3596-4e32-a514-bbb27f2e387c
687648ae-88ea-4df7-af46-11594c96eecb	icon-grid	{"heading":"Etkinlik Alanlarımız","items":[{"icon":"📍","title":"Mekan","description":"Sunset Pool"},{"icon":"🍷","title":"Kokteyl","description":"Teras"},{"icon":"👥","title":"Kişi Sayısı","description":"300 - 500"}],"columns":3}	5	ac40af4c-3596-4e32-a514-bbb27f2e387c
a3607aa4-279d-42de-88ec-3e2bf00cb757	cta	{"heading":"Давайте спланируем","subtitle":"Свяжитесь с нашей командой.","backgroundColor":"dark","buttons":[{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"white"},{"text":"Отправить email","url":"mailto:sales@bluedreamsresort.com","variant":"white-outline"}]}	4	915a3bf4-c53e-4850-842d-9395c5070ce1
15f36499-936c-4c21-bb2b-ce445ed5186b	page-header	{"title":"Bodrum Rehberi","subtitle":"Bodrum hakkında bilmeniz gereken her şey","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"Bodrum","href":"/tr/bodrum"}]}	1	1fe42cac-1805-4bd2-80d8-1af610694be9
30dc97d4-e8b5-40dc-b5bb-73fe16b125c6	image-grid	{"label":"Bodrum","heading":"Keşfedilecek Yerler","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","title":"Bodrum Kalesi","description":"Saint Peter Kalesi ve Sualtı Arkeoloji Müzesi'ne ev sahipliği yapar."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Antik Tiyatro","description":"13.000 kişilik yaz konserleri tiyatrosu."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Bodrum Marina","description":"Lüks yatlar ve deniz kıyısı restoranları."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Gümüşlük Koyu","description":"Antik Myndos ve Tavşan Adası."}],"variant":"card","columns":4}	2	1fe42cac-1805-4bd2-80d8-1af610694be9
7b3067dd-ffa8-42c2-b253-462b712cc583	weather	{"title":"Bodrum Hava Durumu","subtitle":"Aylık ortalama sıcaklıklar","months":[{"name":"Oca","avgHigh":15,"avgLow":7,"icon":"cloud","rainDays":12},{"name":"Şub","avgHigh":15,"avgLow":7,"icon":"cloud","rainDays":10},{"name":"Mar","avgHigh":18,"avgLow":9,"icon":"cloudsun","rainDays":8},{"name":"Nis","avgHigh":21,"avgLow":12,"icon":"sun","rainDays":5},{"name":"May","avgHigh":26,"avgLow":16,"icon":"sun","rainDays":3},{"name":"Haz","avgHigh":31,"avgLow":20,"icon":"sun","rainDays":1},{"name":"Tem","avgHigh":34,"avgLow":23,"icon":"sun","rainDays":0},{"name":"Ağu","avgHigh":34,"avgLow":23,"icon":"sun","rainDays":0},{"name":"Eyl","avgHigh":30,"avgLow":19,"icon":"sun","rainDays":1},{"name":"Eki","avgHigh":25,"avgLow":15,"icon":"cloudsun","rainDays":4},{"name":"Kas","avgHigh":20,"avgLow":11,"icon":"cloud","rainDays":8},{"name":"Ara","avgHigh":16,"avgLow":8,"icon":"cloud","rainDays":11}]}	3	1fe42cac-1805-4bd2-80d8-1af610694be9
a65c3b60-8189-4b12-9e3c-9d8a3153846e	page-header	{"title":"Bodrum Guide","subtitle":"Everything you need to know about Bodrum","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"Bodrum","href":"/en/bodrum"}]}	1	c42c28d7-80d3-4cfd-852a-c3f98517c462
1e9289e6-b3e9-46b6-a9f8-ac4615cc1b06	image-grid	{"label":"Bodrum","heading":"Places to Discover","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","title":"Bodrum Castle","description":"Historic Castle of St. Peter and Underwater Archaeology Museum."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Ancient Theater","description":"Roman theater with 13,000 capacity for summer concerts."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Bodrum Marina","description":"Luxury yachts and waterfront restaurants."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Gümüşlük Bay","description":"Ancient Myndos ruins and Rabbit Island."}],"variant":"card","columns":4}	2	c42c28d7-80d3-4cfd-852a-c3f98517c462
5fa768aa-797c-4464-8bfa-39753dd4cc17	weather	{"title":"Bodrum Weather","subtitle":"Monthly averages","months":[{"name":"Oca","avgHigh":15,"avgLow":7,"icon":"cloud","rainDays":12},{"name":"Şub","avgHigh":15,"avgLow":7,"icon":"cloud","rainDays":10},{"name":"Mar","avgHigh":18,"avgLow":9,"icon":"cloudsun","rainDays":8},{"name":"Nis","avgHigh":21,"avgLow":12,"icon":"sun","rainDays":5},{"name":"May","avgHigh":26,"avgLow":16,"icon":"sun","rainDays":3},{"name":"Haz","avgHigh":31,"avgLow":20,"icon":"sun","rainDays":1},{"name":"Tem","avgHigh":34,"avgLow":23,"icon":"sun","rainDays":0},{"name":"Ağu","avgHigh":34,"avgLow":23,"icon":"sun","rainDays":0},{"name":"Eyl","avgHigh":30,"avgLow":19,"icon":"sun","rainDays":1},{"name":"Eki","avgHigh":25,"avgLow":15,"icon":"cloudsun","rainDays":4},{"name":"Kas","avgHigh":20,"avgLow":11,"icon":"cloud","rainDays":8},{"name":"Ara","avgHigh":16,"avgLow":8,"icon":"cloud","rainDays":11}]}	3	c42c28d7-80d3-4cfd-852a-c3f98517c462
a41b2998-a38c-4dd3-b89c-4ea3e87130c5	page-header	{"title":"Bodrum Reiseführer","subtitle":"Alles über Bodrum","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"Bodrum","href":"/de/bodrum"}]}	1	9280737d-c581-40c7-af1a-ac93d222713d
41a1c9bb-0744-4ac7-8179-2d5e4b900f46	image-grid	{"label":"Bodrum","heading":"Orte zum Entdecken","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","title":"Burg von Bodrum","description":"Historische St. Peter Burg und Unterwasser-Museum."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Antikes Theater","description":"Römisches Theater für Sommerkonzerte."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Bodrum Marina","description":"Luxusyachten und Restaurants am Wasser."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Bucht Gümüşlük","description":"Antike Ruinen von Myndos."}],"variant":"card","columns":4}	2	9280737d-c581-40c7-af1a-ac93d222713d
dc842a15-2d5e-4445-9bb3-aecd7957bbf6	weather	{"title":"Bodrum Wetter","subtitle":"Monatliche Durchschnittswerte","months":[{"name":"Oca","avgHigh":15,"avgLow":7,"icon":"cloud","rainDays":12},{"name":"Şub","avgHigh":15,"avgLow":7,"icon":"cloud","rainDays":10},{"name":"Mar","avgHigh":18,"avgLow":9,"icon":"cloudsun","rainDays":8},{"name":"Nis","avgHigh":21,"avgLow":12,"icon":"sun","rainDays":5},{"name":"May","avgHigh":26,"avgLow":16,"icon":"sun","rainDays":3},{"name":"Haz","avgHigh":31,"avgLow":20,"icon":"sun","rainDays":1},{"name":"Tem","avgHigh":34,"avgLow":23,"icon":"sun","rainDays":0},{"name":"Ağu","avgHigh":34,"avgLow":23,"icon":"sun","rainDays":0},{"name":"Eyl","avgHigh":30,"avgLow":19,"icon":"sun","rainDays":1},{"name":"Eki","avgHigh":25,"avgLow":15,"icon":"cloudsun","rainDays":4},{"name":"Kas","avgHigh":20,"avgLow":11,"icon":"cloud","rainDays":8},{"name":"Ara","avgHigh":16,"avgLow":8,"icon":"cloud","rainDays":11}]}	3	9280737d-c581-40c7-af1a-ac93d222713d
de9066ea-9073-496b-a687-82ce76ef0649	page-header	{"title":"Путеводитель по Бодруму","subtitle":"Всё о Бодруме","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"Бодрум","href":"/ru/bodrum"}]}	1	ce5c2d37-cd90-4d66-b5cb-437d58d0d688
d3e3c999-83ca-4dc5-9732-261d0122d1fd	reviews-section	{"label":"Misafir Yorumları","heading":"Sizden Gelen","headingAccent":"Güzel Sözler","description":"Gerçek deneyimler ve dürüst kelimeler. Misafirlerimizin Blue Dreams Resort'taki konaklamalarını nasıl deneyimlediklerini keşfedin.","bookingScore":"9.4","bookingLabel":"Booking.com Puanı","buttonText":"Tüm Yorumları Oku","buttonUrl":"https://www.google.com/maps","reviews":[{"author":"Ayşe Yılmaz","text":"Balayımız için tercih ettik ve her anından keyif aldık. Özellikle sonsuzluk havuzundaki gün batımı manzarası büyüleyiciydi. Personel çok ilgili ve güleryüzlü.","rating":5},{"author":"Caner Erkin","text":"Torba'daki en iyi konum. Özel plajı tertemiz ve deniz kristal berraklığında. Ana restorandaki yemek çeşitliliği etkileyiciydi, kesinlikle tavsiye ederim.","rating":5},{"author":"Selin Demir","text":"Ailemle harika bir hafta geçirdik. Çocuklar için aktiviteler yeterliydi, biz de spa merkezinde dinlenme fırsatı bulduk. Kesinlikle tekrar geleceğiz.","rating":5}],"sourceLabel":"Google Yorumu"}	6	ee5c8546-0a25-4468-b8fa-bb95d6758f75
c7c8e134-8959-47ec-9280-fc741633ebe9	sustainability	{"heading":"Sürdürülebilirlik","headingAccent":"Taahhüdümüz","text":"Yaşadığımız doğayı seviyoruz ve sorumluluk bilinciyle hareket ediyoruz. Blue Dreams Resort olarak, plastik kullanımını azaltıyor, enerji verimliliğini artırıyor ve yerel ekosistemi korumak için çalışıyoruz. Bu sadece bir trend değil, bir zihniyet.","buttonText":"Nasıl Yapıyoruz?","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg"}	7	ee5c8546-0a25-4468-b8fa-bb95d6758f75
299d8313-2022-4518-b2bd-1a8cb6f33769	location-map	{"lat":37.091832,"lng":27.4824998,"zoom":17,"label":"Konum","title":"Blue Dreams Resort","description":"Ege'nin en güzel koylarından biri olan Torba Zeytinli Kahve Mevkii'nde, denize sıfır konumda sizleri bekliyoruz.","address":"Torba Mahallesi, Herodot Bulvarı No:11\\nBodrum / MUĞLA","directionsText":"Yol Tarifi Al"}	8	ee5c8546-0a25-4468-b8fa-bb95d6758f75
00d40389-3716-4671-adf3-869db4beeef9	cta	{"heading":"%40'a varan özel tekliflerinize ulaşın","subtitle":"Sizin için sunduğumuz en iyi teklifi almak için müşteri temsilcilerimiz sizi bekliyor.","buttonText":"Bizi Arayın","buttonUrl":"tel:+902523371111","background":"brand"}	9	ee5c8546-0a25-4468-b8fa-bb95d6758f75
23b8224d-b74d-45b5-9dd0-233ec567b15d	hero	{"badge":"Pearl of Bodrum","titleLine1":"Aegean Blue","titleLine2":"Dream","subtitle":"Where luxury and tranquility meet in the heart of nature. Welcome to your home, Blue Dreams.","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","scrollText":"Discover","buttons":[{"text":"Explore Rooms","url":"/en/odalar","style":"primary"},{"text":"Promo Video","url":"https://youtu.be/Et5yM-tW7_0","style":"outline","external":true}]}	1	7b07db55-70f7-4a56-bfc7-cac327f07c75
50368ae5-0d2c-4461-8c5d-cddec740afd4	about-statement	{"label":"Blue Dreams Experience","headingParts":[{"text":"Your place "},{"text":"on the Aegean coast","accent":true},{"text":", unique flavors prepared with "},{"text":"the rhythm of seasons","accent":true},{"text":" and where our story "},{"text":"meets yours","accent":true},{"text":"."}]}	2	7b07db55-70f7-4a56-bfc7-cac327f07c75
312240be-f84a-4a65-b205-5a1155190be4	category-cards	{"cards":[{"title":"ROOMS","subtitle":"Designer rooms in the heart of Bodrum","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg","href":"/odalar"},{"title":"RESTAURANT & BAR","subtitle":"A true gastronomic experience","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg","href":"/restoran"},{"title":"ACTIVITIES","subtitle":"Special moments and entertainment","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/WATER-SPORTS-.jpg","href":"/spa"}]}	3	7b07db55-70f7-4a56-bfc7-cac327f07c75
3fb06564-3f02-4b2c-96e2-ed238d5e482a	experience-blocks	{"blocks":[{"label":"Nature & Comfort","h1":"Become one with","h2":"nature","text":"On the pine-covered hills of Torba, overlooking the turquoise waters of the Aegean. Our detached rooms and natural architecture offer a private living space away from the crowds.","buttonText":"Explore Rooms","buttonUrl":"/odalar","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","bgColor":"sand","buttonColor":"gold","reverse":false},{"label":"Gastronomy","h1":"Fresh. Local.","h2":"Sustainable.","text":"Every dish in Blue Dreams kitchen tells a story. Embark on a true culinary journey at our A la Carte restaurants.","buttonText":"Taste the Flavors","buttonUrl":"/restoran","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","detailImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","bgColor":"white","buttonColor":"orange","reverse":true},{"label":"Feel Good","h1":"Relax. Rejuvenate.","h2":"Enjoy.","text":"Feel time slow down while watching the sunset from our infinity pool or unwinding in the serene atmosphere of our Spa center.","buttonText":"Spa & Wellness","buttonUrl":"/spa","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","bgColor":"cream","buttonColor":"brand","reverse":false}]}	4	7b07db55-70f7-4a56-bfc7-cac327f07c75
4d3370a1-83c3-48e1-b633-7a7b4db976c7	local-guide	{"badge":"AI Concierge Selection","heading":"Discover &","headingAccent":"Experience","description":"Bodrum routes and hotel event calendar curated by our AI assistant Blue Concierge, tailored to your interests and the season.","attractionsLabel":"Things to Do Nearby","attractionsLinkText":"See All Routes","attractions":[{"title":"Bodrum Castle & Underwater Museum","distance":"10 km","description":"Historic castle built by Knights of St. John and one of the world's most important underwater archaeology museums.","image":"https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png","tag":"History & Culture"},{"title":"Yalıkavak Marina","distance":"18 km","description":"Meeting point of world brands, gourmet restaurants and luxury yachts.","image":"https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png","tag":"Luxury"},{"title":"Ancient Theatre","distance":"9 km","description":"Dating back to the 4th century BC, the magnificent structure of Halicarnassus.","image":"https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg","tag":"Scenic"}],"eventsLabel":"Upcoming Events","eventsLinkText":"View Calendar","events":[{"day":"15","month":"JUL","title":"Sunset Jazz Sessions","time":"19:30 - 22:00","location":"Pier Bar","description":"Enchanting harmony of saxophone and double bass against the Aegean sunset.","icon":"music"},{"day":"16","month":"JUL","title":"Aegean Herbs & Gastronomy Workshop","time":"14:00 - 16:00","location":"La Gondola Garden","description":"Discover local herbs and learn to prepare healthy Aegean mezes.","icon":"utensils"},{"day":"Every","month":"DAY","title":"Morning Flow Yoga","time":"08:00 - 09:00","location":"Infinity Pool Terrace","description":"Yoga session with professional instructors to start the day refreshed.","icon":"sun"}]}	5	7b07db55-70f7-4a56-bfc7-cac327f07c75
31373795-4f34-4598-92c7-2d6cd1661121	reviews-section	{"label":"Guest Reviews","heading":"Kind Words","headingAccent":"From You","description":"Real experiences and honest words. Discover how our guests experienced their stay at Blue Dreams Resort.","bookingScore":"9.4","bookingLabel":"Booking.com Score","buttonText":"Read All Reviews","buttonUrl":"https://www.google.com/maps","reviews":[{"author":"Ayşe Yılmaz","text":"We chose it for our honeymoon and enjoyed every moment. The sunset view from the infinity pool was breathtaking.","rating":5},{"author":"Caner Erkin","text":"Best location in Torba. The private beach is spotless and the sea is crystal clear.","rating":5},{"author":"Selin Demir","text":"We had a wonderful week with our family. Activities for kids were sufficient.","rating":5}],"sourceLabel":"Google Review"}	6	7b07db55-70f7-4a56-bfc7-cac327f07c75
156b94c3-1e11-4c6e-a819-84bddda01bf2	sustainability	{"heading":"Sustainability","headingAccent":"Commitment","text":"We love the nature we live in and act with responsibility. As Blue Dreams Resort, we reduce plastic use, increase energy efficiency and work to protect the local ecosystem.","buttonText":"How We Do It","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg"}	7	7b07db55-70f7-4a56-bfc7-cac327f07c75
29811737-fbfc-426e-980c-659abb03314a	location-map	{"lat":37.091832,"lng":27.4824998,"zoom":17,"label":"Location","title":"Blue Dreams Resort","description":"We await you at one of the most beautiful coves of the Aegean, in Torba, right on the seafront.","address":"Torba Mahallesi, Herodot Bulvarı No:11\\nBodrum / MUĞLA","directionsText":"Get Directions"}	8	7b07db55-70f7-4a56-bfc7-cac327f07c75
9c856452-ca72-480c-96be-34b9c273a26e	cta	{"heading":"Up to 40% off special offers","subtitle":"Our customer representatives are waiting to present the best offer for you.","buttonText":"Call Us","buttonUrl":"tel:+902523371111","background":"brand"}	9	7b07db55-70f7-4a56-bfc7-cac327f07c75
d433d0a0-dad7-45fb-9a21-1677277a5dbf	hero	{"badge":"Perle von Bodrum","titleLine1":"Ägäischer Blauer","titleLine2":"Traum","subtitle":"Wo Luxus und Ruhe im Herzen der Natur aufeinandertreffen. Willkommen in Ihrem Zuhause, Blue Dreams.","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","scrollText":"Entdecken","buttons":[{"text":"Zimmer Entdecken","url":"/de/odalar","style":"primary"},{"text":"Promovideo","url":"https://youtu.be/Et5yM-tW7_0","style":"outline","external":true}]}	1	eb54ef7f-123c-4c09-97ae-f09e8907e080
7bc94cbb-15bf-4a38-b0d2-97715d18f50c	about-statement	{"label":"Blue Dreams Erlebnis","headingParts":[{"text":"Ihr Platz "},{"text":"an der Ägäisküste","accent":true},{"text":", einzigartige Aromen "},{"text":"im Rhythmus der Jahreszeiten","accent":true},{"text":" und wo unsere Geschichte "},{"text":"auf Ihre trifft","accent":true},{"text":"."}]}	2	eb54ef7f-123c-4c09-97ae-f09e8907e080
674d247e-8ac1-4287-b239-2853e9025e7a	experience-blocks	{"blocks":[{"label":"Natur & Komfort","h1":"Eins werden mit","h2":"der Natur","text":"Auf den kiefernbedeckten Hügeln von Torba, mit Blick auf das türkisfarbene Wasser der Ägäis.","buttonText":"Zimmer Entdecken","buttonUrl":"/odalar","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","bgColor":"sand","buttonColor":"gold","reverse":false},{"label":"Gastronomie","h1":"Frisch. Lokal.","h2":"Nachhaltig.","text":"Jedes Gericht in der Blue Dreams Küche erzählt eine Geschichte.","buttonText":"Geschmack Erleben","buttonUrl":"/restoran","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","detailImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","bgColor":"white","buttonColor":"orange","reverse":true},{"label":"Wohlbefinden","h1":"Entspannen. Erneuern.","h2":"Genießen.","text":"Spüren Sie, wie die Zeit langsamer wird am Infinity-Pool.","buttonText":"Spa & Wellness","buttonUrl":"/spa","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","bgColor":"cream","buttonColor":"brand","reverse":false}]}	4	eb54ef7f-123c-4c09-97ae-f09e8907e080
06009ac3-dc65-46c7-b40f-109cbf7fde9a	local-guide	{"badge":"AI Concierge Auswahl","heading":"Entdecken &","headingAccent":"Erleben","description":"Von unserem KI-Assistenten Blue Concierge kuratierte Bodrum-Routen und Hotelveranstaltungskalender.","attractionsLabel":"Aktivitäten in der Umgebung","attractionsLinkText":"Alle Routen","attractions":[{"title":"Burg von Bodrum","distance":"10 km","description":"Historische Burg der Johanniter und eines der wichtigsten Unterwasser-Archäologie-Museen.","image":"https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png","tag":"Geschichte"},{"title":"Yalıkavak Marina","distance":"18 km","description":"Treffpunkt von Weltmarken, Gourmetrestaurants und Luxusyachten.","image":"https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png","tag":"Luxus"},{"title":"Antikes Theater","distance":"9 km","description":"Aus dem 4. Jahrhundert v. Chr., die prächtige Struktur von Halikarnassos.","image":"https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg","tag":"Aussicht"}],"eventsLabel":"Kommende Veranstaltungen","eventsLinkText":"Kalender Ansehen","events":[{"day":"15","month":"JUL","title":"Sunset Jazz Sessions","time":"19:30 - 22:00","location":"Pier Bar","description":"Bezaubernde Harmonie von Saxophon und Kontrabass.","icon":"music"},{"day":"16","month":"JUL","title":"Ägäische Kräuter Workshop","time":"14:00 - 16:00","location":"La Gondola Garden","description":"Entdecken Sie lokale Kräuter und lernen Sie ägäische Mezes.","icon":"utensils"},{"day":"Jeden","month":"TAG","title":"Morning Flow Yoga","time":"08:00 - 09:00","location":"Infinity Pool Terrasse","description":"Yoga mit professionellen Trainern.","icon":"sun"}]}	5	eb54ef7f-123c-4c09-97ae-f09e8907e080
1a71e79a-2ec8-43ef-bc58-40ea2aeb5898	reviews-section	{"label":"Gästebewertungen","heading":"Nette Worte","headingAccent":"Von Ihnen","description":"Echte Erfahrungen und ehrliche Worte.","bookingScore":"9.4","bookingLabel":"Booking.com Bewertung","buttonText":"Alle Bewertungen Lesen","buttonUrl":"https://www.google.com/maps","reviews":[{"author":"Ayşe Yılmaz","text":"Wir haben es für unsere Flitterwochen gewählt und jeden Moment genossen.","rating":5},{"author":"Caner Erkin","text":"Beste Lage in Torba. Der Privatstrand ist makellos.","rating":5},{"author":"Selin Demir","text":"Wir hatten eine wunderbare Woche mit unserer Familie.","rating":5}],"sourceLabel":"Google Bewertung"}	6	eb54ef7f-123c-4c09-97ae-f09e8907e080
053beab9-1637-48e5-a7f9-95a6cea138e4	sustainability	{"heading":"Nachhaltigkeit","headingAccent":"Engagement","text":"Wir lieben die Natur und handeln verantwortungsbewusst. Als Blue Dreams Resort reduzieren wir den Plastikverbrauch und schützen das lokale Ökosystem.","buttonText":"Wie Wir Es Machen","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg"}	7	eb54ef7f-123c-4c09-97ae-f09e8907e080
f98f0ed5-1992-43f3-ac24-6a8dc14799a2	location-map	{"lat":37.091832,"lng":27.4824998,"zoom":17,"label":"Standort","title":"Blue Dreams Resort","description":"Wir erwarten Sie in einer der schönsten Buchten der Ägäis, in Torba, direkt am Meer.","address":"Torba Mahallesi, Herodot Bulvarı No:11\\nBodrum / MUĞLA","directionsText":"Wegbeschreibung"}	8	eb54ef7f-123c-4c09-97ae-f09e8907e080
44d5ee95-f7d9-47ca-84d1-4227b1b85147	cta	{"heading":"Bis zu 40% Rabatt auf Sonderangebote","subtitle":"Unsere Kundenberater warten darauf, Ihnen das beste Angebot zu präsentieren.","buttonText":"Rufen Sie Uns An","buttonUrl":"tel:+902523371111","background":"brand"}	9	eb54ef7f-123c-4c09-97ae-f09e8907e080
6731089c-b33b-4e5c-ad09-f405f250b0a8	hero	{"badge":"Жемчужина Бодрума","titleLine1":"Эгейская Голубая","titleLine2":"Мечта","subtitle":"Где роскошь и спокойствие встречаются в сердце природы. Добро пожаловать домой, в Blue Dreams.","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","scrollText":"Откройте","buttons":[{"text":"Номера","url":"/ru/odalar","style":"primary"},{"text":"Промо видео","url":"https://youtu.be/Et5yM-tW7_0","style":"outline","external":true}]}	1	18e62055-813c-46be-b90c-4170da82b4f1
a9aa9476-256d-458c-adcc-6550dac97125	about-statement	{"label":"Опыт Blue Dreams","headingParts":[{"text":"Ваше место "},{"text":"на побережье Эгейского моря","accent":true},{"text":", уникальные вкусы "},{"text":"в ритме сезонов","accent":true},{"text":" и где наша история "},{"text":"встречается с вашей","accent":true},{"text":"."}]}	2	18e62055-813c-46be-b90c-4170da82b4f1
2bd36d13-5256-4631-a510-a95626732274	category-cards	{"cards":[{"title":"НОМЕРА","subtitle":"Дизайнерские номера в сердце Бодрума","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg","href":"/odalar"},{"title":"РЕСТОРАН И БАР","subtitle":"Настоящий гастрономический опыт","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg","href":"/restoran"},{"title":"АКТИВНОСТИ","subtitle":"Особые моменты и развлечения","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/WATER-SPORTS-.jpg","href":"/spa"}]}	3	18e62055-813c-46be-b90c-4170da82b4f1
5a23f7e9-c98c-446a-81cc-14b89a0a4296	image-grid	{"label":"Massageoptionen","heading":"Ausgewählte Behandlungen","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Bali Masajı","description":"Endonezya kökenli derin doku masajı","meta":"60 dk"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Aromaterapi","description":"Uçucu yağlarla rahatlatıcı masaj","meta":"45 dk"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Hot Stone","description":"Sıcak taş terapi ile derin gevşeme","meta":"60 dk"}],"variant":"card","columns":3}	3	f1551ae8-279e-4c07-b7aa-46516593bd4f
9e9d14af-d8f8-4ae7-acf6-b8e31cfcc3dd	experience-blocks	{"blocks":[{"label":"Природа и Комфорт","h1":"Станьте единым с","h2":"природой","text":"На покрытых соснами холмах Торбы, с видом на бирюзовые воды Эгейского моря.","buttonText":"Номера","buttonUrl":"/odalar","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","bgColor":"sand","buttonColor":"gold","reverse":false},{"label":"Гастрономия","h1":"Свежее. Местное.","h2":"Устойчивое.","text":"Каждое блюдо на кухне Blue Dreams рассказывает свою историю.","buttonText":"Попробовать","buttonUrl":"/restoran","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","detailImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","bgColor":"white","buttonColor":"orange","reverse":true},{"label":"Хорошее Самочувствие","h1":"Расслабьтесь. Обновитесь.","h2":"Наслаждайтесь.","text":"Почувствуйте, как время замедляется у бассейна инфинити.","buttonText":"Спа и Велнес","buttonUrl":"/spa","image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","bgColor":"cream","buttonColor":"brand","reverse":false}]}	4	18e62055-813c-46be-b90c-4170da82b4f1
37fb3ab6-fa5a-4786-8d19-16a60c1522f0	local-guide	{"badge":"Выбор AI Консьержа","heading":"Откройте &","headingAccent":"Испытайте","description":"Маршруты по Бодруму и календарь мероприятий отеля от нашего AI-ассистента Blue Concierge.","attractionsLabel":"Чем Заняться Поблизости","attractionsLinkText":"Все Маршруты","attractions":[{"title":"Крепость Бодрум","distance":"10 км","description":"Историческая крепость рыцарей Святого Иоанна.","image":"https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png","tag":"История"},{"title":"Ялыкавак Марина","distance":"18 км","description":"Мировые бренды, ресторан высокой кухни и роскошные яхты.","image":"https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png","tag":"Роскошь"},{"title":"Античный Театр","distance":"9 км","description":"IV век до н.э., величественное сооружение Галикарнаса.","image":"https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg","tag":"Вид"}],"eventsLabel":"Предстоящие События","eventsLinkText":"Календарь","events":[{"day":"15","month":"ИЮЛ","title":"Sunset Jazz Sessions","time":"19:30 - 22:00","location":"Pier Bar","description":"Волшебная гармония саксофона и контрабаса.","icon":"music"},{"day":"16","month":"ИЮЛ","title":"Кулинарный Мастер-класс","time":"14:00 - 16:00","location":"La Gondola Garden","description":"Откройте для себя местные травы.","icon":"utensils"},{"day":"Каждый","month":"ДЕНЬ","title":"Morning Flow Yoga","time":"08:00 - 09:00","location":"Терраса бассейна","description":"Йога с профессиональными инструкторами.","icon":"sun"}]}	5	18e62055-813c-46be-b90c-4170da82b4f1
746f727f-4475-467c-8d44-e50bbd84f0dd	reviews-section	{"label":"Отзывы Гостей","heading":"Добрые Слова","headingAccent":"От Вас","description":"Реальные впечатления и честные слова.","bookingScore":"9.4","bookingLabel":"Оценка Booking.com","buttonText":"Все Отзывы","buttonUrl":"https://www.google.com/maps","reviews":[{"author":"Айше Йылмаз","text":"Мы выбрали его для медового месяца и наслаждались каждым моментом.","rating":5},{"author":"Джанер Эркин","text":"Лучшее расположение в Торбе. Частный пляж безупречен.","rating":5},{"author":"Селин Демир","text":"Прекрасная неделя с семьей. Достаточно развлечений для детей.","rating":5}],"sourceLabel":"Отзыв Google"}	6	18e62055-813c-46be-b90c-4170da82b4f1
0d859d62-c7d2-45d6-bf59-defa5cb24fd8	sustainability	{"heading":"Устойчивое","headingAccent":"Развитие","text":"Мы любим природу и действуем ответственно. Blue Dreams Resort сокращает использование пластика и защищает экосистему.","buttonText":"Как Мы Это Делаем","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg"}	7	18e62055-813c-46be-b90c-4170da82b4f1
bd67f635-b46e-426a-9415-47efa6c26f8f	location-map	{"lat":37.091832,"lng":27.4824998,"zoom":17,"label":"Расположение","title":"Blue Dreams Resort","description":"Мы ждём вас в одной из самых красивых бухт Эгейского моря, в Торбе.","address":"Torba Mahallesi, Herodot Bulvarı No:11\\nBodrum / MUĞLA","directionsText":"Проложить Маршрут"}	8	18e62055-813c-46be-b90c-4170da82b4f1
eb6d8ea2-4b96-4ca8-9534-c1283d5592b9	cta	{"heading":"Скидки до 40% на специальные предложения","subtitle":"Наши консультанты ждут, чтобы предложить лучшую цену.","buttonText":"Позвоните Нам","buttonUrl":"tel:+902523371111","background":"brand"}	9	18e62055-813c-46be-b90c-4170da82b4f1
18488ab9-1ccc-4260-bd45-993d1067a315	page-header	{"title":"Hakkımızda","subtitle":"Blue Dreams Resort hikayesi","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"Hakkımızda","href":"/tr/hakkimizda"}]}	1	aa824782-cbbf-4f5f-86a1-369ba0b6a780
2c3bfc2f-6090-48a8-b0c0-b9247323d6a7	text-image	{"label":"Hikayemiz","heading":"25 Yıllık","headingAccent":"Tutku","paragraphs":["Blue Dreams Resort, 1998 yılından bu yana Bodrum'un Torba koyunda, Ege'nin eşsiz mavisinde misafirlerini ağırlamaktadır.","55.000 m²'lik alanda konumlanan tesisimiz, 340'ı aşkın odasıyla her yıl binlerce misafire ev sahipliği yapmaktadır.","Doğa ile iç içe, modern konforu tarihsel dokuyla harmanlayan anlayışımızla, unutulmaz tatil deneyimleri sunuyoruz."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","imageAlt":"Blue Dreams Resort","badge":{"value":"25+","label":"Yıllık Tecrübe"}}	2	aa824782-cbbf-4f5f-86a1-369ba0b6a780
73db75ca-4736-45f0-b582-b0dfbf810e36	stats	{"items":[{"icon":"award","value":"5★","label":"Otel Sınıfı"},{"icon":"users","value":"340+","label":"Oda Sayısı"},{"icon":"calendar","value":"1998","label":"Kuruluş Yılı"},{"icon":"mappin","value":"55K","label":"Alan (m²)"}]}	3	aa824782-cbbf-4f5f-86a1-369ba0b6a780
f000bd23-7658-4a50-b776-99739b9f158e	icon-grid	{"label":"Değerlerimiz","heading":"Temel İlkelerimiz","items":[{"icon":"🌊","title":"Doğallık","description":"Ege doğasıyla uyum içinde yaşam"},{"icon":"✨","title":"Mükemmellik","description":"Her detayda kusursuz hizmet anlayışı"},{"icon":"🌿","title":"Sürdürülebilirlik","description":"Gelecek nesiller için doğayı koruma"}]}	4	aa824782-cbbf-4f5f-86a1-369ba0b6a780
41892b7b-fa96-41d5-81b7-ad117483f212	cta	{"heading":"Sizi Bekliyoruz","subtitle":"Hayalinizdeki tatili birlikte planlayalım.","backgroundColor":"white","buttons":[{"text":"İletişim","url":"/tr/iletisim","variant":"primary"},{"text":"Online Rezervasyon","url":"https://blue-dreams.rezervasyonal.com/","variant":"outline"}]}	5	aa824782-cbbf-4f5f-86a1-369ba0b6a780
be5df39a-96ba-4aef-a217-c765b864da64	image-grid	{"label":"Варианты массажа","heading":"Избранные процедуры","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Bali Masajı","description":"Endonezya kökenli derin doku masajı","meta":"60 dk"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Aromaterapi","description":"Uçucu yağlarla rahatlatıcı masaj","meta":"45 dk"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Hot Stone","description":"Sıcak taş terapi ile derin gevşeme","meta":"60 dk"}],"variant":"card","columns":3}	3	8131988e-8670-4c72-b569-a84dc6228770
9d408aff-0f60-475f-b9ae-9d375805d4d0	icon-grid	{"heading":"Почему Naya Spa?","backgroundColor":"dark","items":[{"icon":"🌿","title":"Органические продукты","description":"Натуральные и органические средства ухода"},{"icon":"💆","title":"Эксперты-терапевты","description":"Сертифицированная профессиональная команда"},{"icon":"🕊️","title":"Атмосфера покоя","description":"Спа в гармонии с природой"}]}	4	8131988e-8670-4c72-b569-a84dc6228770
1a123832-03d0-4011-8610-dd91a71c1d4f	image-grid	{"label":"Удобства","heading":"Наши спа-удобства","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Инфинити пул","description":"Бассейн на берегу моря"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Частный пляж","description":"Частный пляж с кристально чистой водой"},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Фитнес-центр","description":"Современный тренажерный зал"}],"variant":"simple","columns":3}	5	8131988e-8670-4c72-b569-a84dc6228770
f66a8c3e-c6ec-4444-b521-31d375e4cda8	cta	{"heading":"Побалуйте себя","subtitle":"Запишитесь на профессиональный уход и массаж в Naya Spa.","backgroundColor":"gradient","buttons":[{"text":"Записаться","url":"https://wa.me/905495167823","variant":"white"},{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"white-outline"}]}	6	8131988e-8670-4c72-b569-a84dc6228770
551eb532-445c-45ef-b12b-106aecdff61f	page-header	{"title":"İletişim","subtitle":"Sorularınız için bize ulaşın","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","breadcrumbs":[{"label":"İletişim","href":"/tr/iletisim"}]}	1	49728faf-e6d4-4a90-8aff-62cd9ce8fc5f
1fcce4ad-c0cd-408f-b44f-b865ed58f086	contact	{"infoLabel":"İletişim Bilgileri","infoHeading":"Bize","infoHeadingAccent":"Ulaşın","address":"Torba Mahallesi Herodot Bulvarı No:11\\nBodrum / MUĞLA / TÜRKİYE","phone":"+90 252 337 11 11","whatsapp":"+90 549 516 78 03","email":"sales@bluedreamsresort.com","hours":"Resepsiyon: 7/24\\nRezervasyon: 09:00 - 22:00","socialLinks":{"facebook":"https://www.facebook.com/bluedreamshotel","instagram":"https://www.instagram.com/clubbluedreamsresort/","youtube":"https://www.youtube.com/@bluedreamsresort8738/videos","linkedin":"https://www.linkedin.com/company/bluedreamsresortbodrum"},"subjects":[{"value":"reservation","label":"Rezervasyon"},{"value":"info","label":"Bilgi Talebi"},{"value":"complaint","label":"Şikayet"},{"value":"other","label":"Diğer"}]}	2	49728faf-e6d4-4a90-8aff-62cd9ce8fc5f
284ca396-4348-4983-8b47-1409eff429bf	map	{"lat":37.091832,"lng":27.4824998,"zoom":15}	3	49728faf-e6d4-4a90-8aff-62cd9ce8fc5f
6ea21cd6-05f0-415e-8846-b2a165fdcad8	page-header	{"title":"Contact","subtitle":"Get in touch with us","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","breadcrumbs":[{"label":"Contact","href":"/en/iletisim"}]}	1	d40aa3d8-1a09-4243-ae53-3fdc5e4b89c5
53d9ed96-d1af-40a2-98db-354c751233d1	contact	{"infoLabel":"Contact Info","infoHeading":"Get in","infoHeadingAccent":"Touch","address":"Torba Mahallesi Herodot Bulvarı No:11\\nBodrum / MUĞLA / TÜRKİYE","phone":"+90 252 337 11 11","whatsapp":"+90 549 516 78 03","email":"sales@bluedreamsresort.com","hours":"Reception: 24/7\\nReservations: 09:00 - 22:00","socialLinks":{"facebook":"https://www.facebook.com/bluedreamshotel","instagram":"https://www.instagram.com/clubbluedreamsresort/","youtube":"https://www.youtube.com/@bluedreamsresort8738/videos","linkedin":"https://www.linkedin.com/company/bluedreamsresortbodrum"},"subjects":[{"value":"reservation","label":"Reservation"},{"value":"info","label":"Information"},{"value":"complaint","label":"Complaint"},{"value":"other","label":"Other"}]}	2	d40aa3d8-1a09-4243-ae53-3fdc5e4b89c5
d8747c50-8bb6-484c-8367-dfffe8f516d2	map	{"lat":37.091832,"lng":27.4824998,"zoom":15}	3	d40aa3d8-1a09-4243-ae53-3fdc5e4b89c5
ec5b60dc-fa49-464e-8e7f-ab34ed09a81d	page-header	{"title":"Kontakt","subtitle":"Kontaktieren Sie uns","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","breadcrumbs":[{"label":"Kontakt","href":"/de/iletisim"}]}	1	96676306-d534-4cd8-b649-220f3f1eafd2
e6b77307-c99c-4f0b-ab94-7b62aa7dae0b	contact	{"infoLabel":"Contact Info","infoHeading":"Get in","infoHeadingAccent":"Touch","address":"Torba Mahallesi Herodot Bulvarı No:11\\nBodrum / MUĞLA / TÜRKİYE","phone":"+90 252 337 11 11","whatsapp":"+90 549 516 78 03","email":"sales@bluedreamsresort.com","hours":"Reception: 24/7\\nReservations: 09:00 - 22:00","socialLinks":{"facebook":"https://www.facebook.com/bluedreamshotel","instagram":"https://www.instagram.com/clubbluedreamsresort/","youtube":"https://www.youtube.com/@bluedreamsresort8738/videos","linkedin":"https://www.linkedin.com/company/bluedreamsresortbodrum"},"subjects":[{"value":"reservation","label":"Reservation"},{"value":"info","label":"Information"},{"value":"complaint","label":"Complaint"},{"value":"other","label":"Other"}]}	2	96676306-d534-4cd8-b649-220f3f1eafd2
030fe773-351e-464b-a2a3-3770499b6c12	map	{"lat":37.091832,"lng":27.4824998,"zoom":15}	3	96676306-d534-4cd8-b649-220f3f1eafd2
6381236e-4111-4751-8e7d-03dca11a58c3	page-header	{"title":"Контакты","subtitle":"Свяжитесь с нами","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","breadcrumbs":[{"label":"Контакты","href":"/ru/iletisim"}]}	1	0f0b9914-5924-4166-bbdc-6f5abf57eeec
7e0bcd28-6749-4e7b-88f4-7251ca2f9974	contact	{"infoLabel":"Contact Info","infoHeading":"Get in","infoHeadingAccent":"Touch","address":"Torba Mahallesi Herodot Bulvarı No:11\\nBodrum / MUĞLA / TÜRKİYE","phone":"+90 252 337 11 11","whatsapp":"+90 549 516 78 03","email":"sales@bluedreamsresort.com","hours":"Reception: 24/7\\nReservations: 09:00 - 22:00","socialLinks":{"facebook":"https://www.facebook.com/bluedreamshotel","instagram":"https://www.instagram.com/clubbluedreamsresort/","youtube":"https://www.youtube.com/@bluedreamsresort8738/videos","linkedin":"https://www.linkedin.com/company/bluedreamsresortbodrum"},"subjects":[{"value":"reservation","label":"Reservation"},{"value":"info","label":"Information"},{"value":"complaint","label":"Complaint"},{"value":"other","label":"Other"}]}	2	0f0b9914-5924-4166-bbdc-6f5abf57eeec
9b08fc1b-5286-4b0a-bb15-a8328fb030a2	gallery	{"images":[{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00128.jpg","title":"Wedding 1"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.40.42.jpeg","title":"Wedding 2"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.39.56.jpeg","title":"Wedding 3"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00170.jpg","title":"Wedding 4"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg","title":"Wedding 5"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0713_MR_2020__U5A2186_3.jpg","title":"Wedding 6"}]}	6	ac40af4c-3596-4e32-a514-bbb27f2e387c
3045c7ec-25df-4cb3-b11b-2c8eb5749777	hero	{"backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3-1024x682.jpg","titleLine1":"Wedding & Events","subtitle":"A unique atmosphere for your special moments"}	1	ba18a248-ecf5-4b43-84c4-273190989c55
3ae3ec50-983f-4333-b190-4174b79789c7	text-image	{"heading":"Where Dreams Come True","headingAccent":"Blue Dreams Resort","paragraphs":["The most beautiful view of Bodrum at your feet. We make your dream wedding come true with our beachfront location and professional team."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg","imagePosition":"left","listItems":["Unique Sunset View","Special Cocktail & Dinner Menus","Professional Organization Support"]}	2	ba18a248-ecf5-4b43-84c4-273190989c55
38d88c43-4a7f-4751-a11e-c41e65f0a716	youtube	{"videos":[{"url":"https://www.youtube.com/embed/JJc20SjIENQ?controls=1&rel=0","title":"Wedding Video 1"},{"url":"https://www.youtube.com/embed/KDfh1NV2eUc?controls=1&rel=0","title":"Wedding Video 2"}],"columns":2}	3	ba18a248-ecf5-4b43-84c4-273190989c55
9891ad20-c423-4f24-a422-07d8de28a513	cta	{"heading":"Professional Organization Team","subtitle":"We plan the night of your dreams down to the last detail.","backgroundColor":"brand"}	4	ba18a248-ecf5-4b43-84c4-273190989c55
46534271-c0f7-498d-8e79-828ba06bbf1e	icon-grid	{"heading":"Our Event Venues","items":[{"icon":"📍","title":"Venue","description":"Sunset Pool"},{"icon":"🍷","title":"Cocktail","description":"Terrace"},{"icon":"👥","title":"Capacity","description":"300 - 500"}],"columns":3}	5	ba18a248-ecf5-4b43-84c4-273190989c55
f2d52d84-be62-40ed-bc94-82b249aedc66	gallery	{"images":[{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00128.jpg","title":"Wedding 1"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.40.42.jpeg","title":"Wedding 2"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.39.56.jpeg","title":"Wedding 3"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00170.jpg","title":"Wedding 4"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg","title":"Wedding 5"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0713_MR_2020__U5A2186_3.jpg","title":"Wedding 6"}]}	6	ba18a248-ecf5-4b43-84c4-273190989c55
3361aa24-0c5b-4ab6-a52f-2d4e731fbf57	hero	{"backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3-1024x682.jpg","titleLine1":"Wedding & Events","subtitle":"A unique atmosphere for your special moments"}	1	29b25d00-b8cc-441b-aa06-a4f729a9d486
780b274e-a351-404b-a13d-15a4a3d625fe	text-image	{"heading":"Where Dreams Come True","headingAccent":"Blue Dreams Resort","paragraphs":["The most beautiful view of Bodrum at your feet. We make your dream wedding come true with our beachfront location and professional team."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg","imagePosition":"left","listItems":["Unique Sunset View","Special Cocktail & Dinner Menus","Professional Organization Support"]}	2	29b25d00-b8cc-441b-aa06-a4f729a9d486
e51460ad-83a7-4380-9d60-55886656c7a4	youtube	{"videos":[{"url":"https://www.youtube.com/embed/JJc20SjIENQ?controls=1&rel=0","title":"Wedding Video 1"},{"url":"https://www.youtube.com/embed/KDfh1NV2eUc?controls=1&rel=0","title":"Wedding Video 2"}],"columns":2}	3	29b25d00-b8cc-441b-aa06-a4f729a9d486
8a8db5af-6ae4-43cf-8b50-80ff5f0a7bd5	cta	{"heading":"Professional Organization Team","subtitle":"We plan the night of your dreams down to the last detail.","backgroundColor":"brand"}	4	29b25d00-b8cc-441b-aa06-a4f729a9d486
d9535868-7d32-4937-ae8d-49e274e8c9d0	icon-grid	{"heading":"Our Event Venues","items":[{"icon":"📍","title":"Venue","description":"Sunset Pool"},{"icon":"🍷","title":"Cocktail","description":"Terrace"},{"icon":"👥","title":"Capacity","description":"300 - 500"}],"columns":3}	5	29b25d00-b8cc-441b-aa06-a4f729a9d486
81c6e876-9254-4421-a42a-9a4ee43d2eb4	gallery	{"images":[{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00128.jpg","title":"Wedding 1"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.40.42.jpeg","title":"Wedding 2"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.39.56.jpeg","title":"Wedding 3"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00170.jpg","title":"Wedding 4"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg","title":"Wedding 5"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0713_MR_2020__U5A2186_3.jpg","title":"Wedding 6"}]}	6	29b25d00-b8cc-441b-aa06-a4f729a9d486
d080daba-863d-4425-a4a7-ebabb1a4ce08	hero	{"backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3-1024x682.jpg","titleLine1":"Wedding & Events","subtitle":"A unique atmosphere for your special moments"}	1	bb29ac56-0bd9-4994-a016-4c1abff57e7a
3a4cbb0d-a5b2-4a73-be71-1e71d385f53c	text-image	{"heading":"Where Dreams Come True","headingAccent":"Blue Dreams Resort","paragraphs":["The most beautiful view of Bodrum at your feet. We make your dream wedding come true with our beachfront location and professional team."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg","imagePosition":"left","listItems":["Unique Sunset View","Special Cocktail & Dinner Menus","Professional Organization Support"]}	2	bb29ac56-0bd9-4994-a016-4c1abff57e7a
e7956382-d05a-4b6c-be54-bf0b46f4b1ef	youtube	{"videos":[{"url":"https://www.youtube.com/embed/JJc20SjIENQ?controls=1&rel=0","title":"Wedding Video 1"},{"url":"https://www.youtube.com/embed/KDfh1NV2eUc?controls=1&rel=0","title":"Wedding Video 2"}],"columns":2}	3	bb29ac56-0bd9-4994-a016-4c1abff57e7a
2195c796-54fb-4025-a256-e9d1ed7d21dd	cta	{"heading":"Professional Organization Team","subtitle":"We plan the night of your dreams down to the last detail.","backgroundColor":"brand"}	4	bb29ac56-0bd9-4994-a016-4c1abff57e7a
9698720d-22be-4ca5-8f45-1f5d3459887d	icon-grid	{"heading":"Our Event Venues","items":[{"icon":"📍","title":"Venue","description":"Sunset Pool"},{"icon":"🍷","title":"Cocktail","description":"Terrace"},{"icon":"👥","title":"Capacity","description":"300 - 500"}],"columns":3}	5	bb29ac56-0bd9-4994-a016-4c1abff57e7a
f4dd8c0f-69b3-41b1-80a2-3b0de91c6c3e	gallery	{"images":[{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00128.jpg","title":"Wedding 1"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.40.42.jpeg","title":"Wedding 2"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.39.56.jpeg","title":"Wedding 3"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00170.jpg","title":"Wedding 4"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg","title":"Wedding 5"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/04/0713_MR_2020__U5A2186_3.jpg","title":"Wedding 6"}]}	6	bb29ac56-0bd9-4994-a016-4c1abff57e7a
7cdbf614-f050-47c6-bf7d-cb03708eb671	page-header	{"title":"Galeri","subtitle":"Blue Dreams Resort'un atmosferini fotoğraflarla keşfedin.","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"Galeri","href":"/tr/galeri"}]}	1	2fbd7be2-a0b0-467d-8a2b-fe79496f46ab
09d90eb6-775e-4394-a7c7-9864b00314cf	gallery	{"images":[{"src":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","title":"Aerial View","category":"Genel"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg","title":"Deluxe Room","category":"Odalar"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Infinity Pool","category":"Plaj & Havuz"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg","title":"Pool View","category":"Plaj & Havuz"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Sandy Beach","category":"Plaj & Havuz"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","title":"Italian Restaurant","category":"Gastronomi"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","title":"Open Buffet","category":"Gastronomi"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Club Room","category":"Odalar"}]}	2	2fbd7be2-a0b0-467d-8a2b-fe79496f46ab
ac5f0c12-4902-4303-bc41-2ecb1bab412b	page-header	{"title":"Gallery","subtitle":"Discover the atmosphere of Blue Dreams Resort through photos.","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"Gallery","href":"/en/galeri"}]}	1	afd41806-0f06-48d6-8ef3-1465f65fce23
c7f5c7ce-9ae6-41c9-ad03-53c6324411f7	gallery	{"images":[{"src":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","title":"Aerial View","category":"General"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg","title":"Deluxe Room","category":"Rooms"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Infinity Pool","category":"Beach & Pool"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg","title":"Pool View","category":"Beach & Pool"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Sandy Beach","category":"Beach & Pool"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","title":"Italian Restaurant","category":"Gastronomy"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","title":"Open Buffet","category":"Gastronomy"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Club Room","category":"Rooms"}]}	2	afd41806-0f06-48d6-8ef3-1465f65fce23
1e93a619-d362-4df4-866b-993a05a82a8c	page-header	{"title":"Gallery","subtitle":"Discover the atmosphere of Blue Dreams Resort through photos.","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"Gallery","href":"/de/galeri"}]}	1	6e5c75d2-1d29-4866-9f8d-b6bce7bcd9f5
f96e366e-5af8-4b2c-ae1c-a922d49de0e4	gallery	{"images":[{"src":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","title":"Aerial View","category":"General"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg","title":"Deluxe Room","category":"Rooms"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Infinity Pool","category":"Beach & Pool"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg","title":"Pool View","category":"Beach & Pool"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Sandy Beach","category":"Beach & Pool"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","title":"Italian Restaurant","category":"Gastronomy"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","title":"Open Buffet","category":"Gastronomy"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Club Room","category":"Rooms"}]}	2	6e5c75d2-1d29-4866-9f8d-b6bce7bcd9f5
c77bef8e-8670-4513-8acf-7ec4ee20cbfe	page-header	{"title":"Gallery","subtitle":"Discover the atmosphere of Blue Dreams Resort through photos.","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"Gallery","href":"/ru/galeri"}]}	1	094f5791-d243-4d10-ac39-c093c466ed3e
20492389-129d-4366-9c29-8fa75627f1a7	gallery	{"images":[{"src":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","title":"Aerial View","category":"General"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg","title":"Deluxe Room","category":"Rooms"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Infinity Pool","category":"Beach & Pool"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg","title":"Pool View","category":"Beach & Pool"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Sandy Beach","category":"Beach & Pool"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","title":"Italian Restaurant","category":"Gastronomy"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","title":"Open Buffet","category":"Gastronomy"},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Club Room","category":"Rooms"}]}	2	094f5791-d243-4d10-ac39-c093c466ed3e
1c8c5090-d753-48a8-a3b5-fabfef30d5e3	page-header	{"title":"Toplantı & Etkinlik Alanları","subtitle":"Kurumsal etkinlikleriniz için profesyonel çözümler","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","breadcrumbs":[{"label":"Toplantı & Etkinlik","href":"/tr/toplanti-salonu"}]}	1	37a15bf4-78b3-48bf-b5f5-21328262ddf5
0ef17f85-24b0-4ab5-b258-1341b8d8a0ce	text-image	{"label":"Ana Salon","heading":"İstanbul Salonu","paragraphs":["En büyük salonumuz olan İstanbul, 770 m² genişliği ile büyük kongreler ve gala yemekleri için idealdir."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","badge":{"value":"770 m²","label":"Ana Salon"},"buttons":[{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"primary"}]}	2	37a15bf4-78b3-48bf-b5f5-21328262ddf5
f07c7bb9-2bbe-4c99-8d3e-e531b8806cf5	table	{"label":"Toplantı Odaları","heading":"Farklı İhtiyaçlar İçin Farklı Mekanlar","backgroundColor":"sand","columns":[{"key":"name","label":"Salon Adı"},{"key":"theater","label":"Tiyatro Düzeni","align":"center"},{"key":"meeting","label":"Toplantı Düzeni","align":"center"},{"key":"size","label":"Boyut","align":"center"},{"key":"height","label":"Yükseklik","align":"center"}],"rows":[{"name":"Turunç","theater":"35","meeting":"10","size":"4.50 x 6.50 mt","height":"3.20 mt"},{"name":"Salamis","theater":"45","meeting":"14","size":"8.30 x 4.35 mt","height":"2.70 mt"},{"name":"Belek","theater":"20","meeting":"10","size":"4.40 x 4.40 mt","height":"2.70 mt"},{"name":"Marmaris","theater":"30","meeting":"10","size":"4.30 x 5.30 mt","height":"2.70 mt"},{"name":"Stockholm","theater":"20","meeting":"10","size":"4.30 x 4.40 mt","height":"2.70 mt"}]}	3	37a15bf4-78b3-48bf-b5f5-21328262ddf5
3c388a1d-5551-4077-9be4-9c4d7049df6d	cta	{"heading":"Etkinliğinizi Planlayalım","subtitle":"Kurumsal toplantılarınız için ekibimizle iletişime geçin.","backgroundColor":"dark","buttons":[{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"white"},{"text":"E-posta Gönderin","url":"mailto:sales@bluedreamsresort.com","variant":"white-outline"}]}	4	37a15bf4-78b3-48bf-b5f5-21328262ddf5
2276ddf8-6186-49ba-b72c-b509cadce469	page-header	{"title":"Meeting & Event Venues","subtitle":"Professional solutions for corporate events","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","breadcrumbs":[{"label":"Meeting & Events","href":"/en/toplanti-salonu"}]}	1	f5126d06-0a98-4293-8d64-4851d1414e99
19465f6c-934b-4ab4-b8f9-7240dadcbbea	text-image	{"label":"Main Hall","heading":"İstanbul Salonu","paragraphs":["Our largest hall Istanbul, with 770 m² area, is ideal for large congresses and gala dinners."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","badge":{"value":"770 m²","label":"Main Hall"},"buttons":[{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"primary"}]}	2	f5126d06-0a98-4293-8d64-4851d1414e99
3edccf8c-8629-4eb6-925d-4cd392766cc8	table	{"label":"Meeting Rooms","heading":"Different Venues for Different Needs","backgroundColor":"sand","columns":[{"key":"name","label":"Hall Name"},{"key":"theater","label":"Theater Layout","align":"center"},{"key":"meeting","label":"Meeting Layout","align":"center"},{"key":"size","label":"Size","align":"center"},{"key":"height","label":"Height","align":"center"}],"rows":[{"name":"Turunç","theater":"35","meeting":"10","size":"4.50 x 6.50 mt","height":"3.20 mt"},{"name":"Salamis","theater":"45","meeting":"14","size":"8.30 x 4.35 mt","height":"2.70 mt"},{"name":"Belek","theater":"20","meeting":"10","size":"4.40 x 4.40 mt","height":"2.70 mt"},{"name":"Marmaris","theater":"30","meeting":"10","size":"4.30 x 5.30 mt","height":"2.70 mt"},{"name":"Stockholm","theater":"20","meeting":"10","size":"4.30 x 4.40 mt","height":"2.70 mt"}]}	3	f5126d06-0a98-4293-8d64-4851d1414e99
ec38a211-82d9-4df1-b1a7-f548985353d0	cta	{"heading":"Let Us Plan Your Event","subtitle":"Contact our team for your corporate meetings.","backgroundColor":"dark","buttons":[{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"white"},{"text":"Send Email","url":"mailto:sales@bluedreamsresort.com","variant":"white-outline"}]}	4	f5126d06-0a98-4293-8d64-4851d1414e99
b2955eba-c452-49c2-aacb-112c2578d77f	page-header	{"title":"Tagungs- & Veranstaltungsräume","subtitle":"Professionelle Lösungen für Firmenveranstaltungen","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","breadcrumbs":[{"label":"Tagung & Events","href":"/de/toplanti-salonu"}]}	1	b218da34-5c82-47e6-b2c6-2cd5d26ccc53
a93baf0a-0865-40b5-acac-60e0ecff4824	text-image	{"label":"Hauptsaal","heading":"İstanbul Salonu","paragraphs":["Unser größter Saal Istanbul mit 770 m² ist ideal für Kongresse und Galadinner."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","badge":{"value":"770 m²","label":"Hauptsaal"},"buttons":[{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"primary"}]}	2	b218da34-5c82-47e6-b2c6-2cd5d26ccc53
9f40ee0c-b793-47b5-9d95-0596cc17d0e0	table	{"label":"Tagungsräume","heading":"Verschiedene Räume für verschiedene Bedürfnisse","backgroundColor":"sand","columns":[{"key":"name","label":"Saalname"},{"key":"theater","label":"Theaterbestuhlung","align":"center"},{"key":"meeting","label":"Tagungsbestuhlung","align":"center"},{"key":"size","label":"Größe","align":"center"},{"key":"height","label":"Höhe","align":"center"}],"rows":[{"name":"Turunç","theater":"35","meeting":"10","size":"4.50 x 6.50 mt","height":"3.20 mt"},{"name":"Salamis","theater":"45","meeting":"14","size":"8.30 x 4.35 mt","height":"2.70 mt"},{"name":"Belek","theater":"20","meeting":"10","size":"4.40 x 4.40 mt","height":"2.70 mt"},{"name":"Marmaris","theater":"30","meeting":"10","size":"4.30 x 5.30 mt","height":"2.70 mt"},{"name":"Stockholm","theater":"20","meeting":"10","size":"4.30 x 4.40 mt","height":"2.70 mt"}]}	3	b218da34-5c82-47e6-b2c6-2cd5d26ccc53
e72c89a2-89c3-4d8d-a3a2-cfc7790c0781	cta	{"heading":"Lassen Sie uns planen","subtitle":"Kontaktieren Sie unser Team.","backgroundColor":"dark","buttons":[{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"white"},{"text":"E-Mail senden","url":"mailto:sales@bluedreamsresort.com","variant":"white-outline"}]}	4	b218da34-5c82-47e6-b2c6-2cd5d26ccc53
33254efb-2443-46a7-8432-ae4e595c03e7	page-header	{"title":"Конференц-залы","subtitle":"Профессиональные решения для мероприятий","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","breadcrumbs":[{"label":"Конференции","href":"/ru/toplanti-salonu"}]}	1	915a3bf4-c53e-4850-842d-9395c5070ce1
ab4cb1cb-66f0-4b72-bcd1-80f68bfa4374	text-image	{"label":"Главный зал","heading":"İstanbul Salonu","paragraphs":["Наш самый большой зал Стамбул площадью 770 м² идеален для конгрессов и гала-ужинов."],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg","badge":{"value":"770 m²","label":"Главный зал"},"buttons":[{"text":"+90 252 337 11 11","url":"tel:+902523371111","variant":"primary"}]}	2	915a3bf4-c53e-4850-842d-9395c5070ce1
b7f49ce6-899f-46a8-a7b0-68d9a13f6b6c	table	{"label":"Залы заседаний","heading":"Разные залы для разных потребностей","backgroundColor":"sand","columns":[{"key":"name","label":"Название"},{"key":"theater","label":"Театр","align":"center"},{"key":"meeting","label":"Переговоры","align":"center"},{"key":"size","label":"Размер","align":"center"},{"key":"height","label":"Высота","align":"center"}],"rows":[{"name":"Turunç","theater":"35","meeting":"10","size":"4.50 x 6.50 mt","height":"3.20 mt"},{"name":"Salamis","theater":"45","meeting":"14","size":"8.30 x 4.35 mt","height":"2.70 mt"},{"name":"Belek","theater":"20","meeting":"10","size":"4.40 x 4.40 mt","height":"2.70 mt"},{"name":"Marmaris","theater":"30","meeting":"10","size":"4.30 x 5.30 mt","height":"2.70 mt"},{"name":"Stockholm","theater":"20","meeting":"10","size":"4.30 x 4.40 mt","height":"2.70 mt"}]}	3	915a3bf4-c53e-4850-842d-9395c5070ce1
d8d99f2b-33f8-473a-9189-d8e06367a686	image-grid	{"label":"Bodrum","heading":"Достопримечательности","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","title":"Замок Бодрума","description":"Замок Святого Петра и Музей подводной археологии."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"Античный театр","description":"Римский театр на 13 000 мест."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"Марина Бодрума","description":"Роскошные яхты и рестораны."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg","title":"Бухта Гюмюшлюк","description":"Руины древнего Миндоса."}],"variant":"card","columns":4}	2	ce5c2d37-cd90-4d66-b5cb-437d58d0d688
997f4fb8-001e-45ae-9ffc-154530840654	weather	{"title":"Погода в Бодруме","subtitle":"Среднемесячные показатели","months":[{"name":"Oca","avgHigh":15,"avgLow":7,"icon":"cloud","rainDays":12},{"name":"Şub","avgHigh":15,"avgLow":7,"icon":"cloud","rainDays":10},{"name":"Mar","avgHigh":18,"avgLow":9,"icon":"cloudsun","rainDays":8},{"name":"Nis","avgHigh":21,"avgLow":12,"icon":"sun","rainDays":5},{"name":"May","avgHigh":26,"avgLow":16,"icon":"sun","rainDays":3},{"name":"Haz","avgHigh":31,"avgLow":20,"icon":"sun","rainDays":1},{"name":"Tem","avgHigh":34,"avgLow":23,"icon":"sun","rainDays":0},{"name":"Ağu","avgHigh":34,"avgLow":23,"icon":"sun","rainDays":0},{"name":"Eyl","avgHigh":30,"avgLow":19,"icon":"sun","rainDays":1},{"name":"Eki","avgHigh":25,"avgLow":15,"icon":"cloudsun","rainDays":4},{"name":"Kas","avgHigh":20,"avgLow":11,"icon":"cloud","rainDays":8},{"name":"Ara","avgHigh":16,"avgLow":8,"icon":"cloud","rainDays":11}]}	3	ce5c2d37-cd90-4d66-b5cb-437d58d0d688
\.


--
-- Name: AdminUser AdminUser_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."AdminUser"
    ADD CONSTRAINT "AdminUser_pkey" PRIMARY KEY (id);


--
-- Name: AiSettings AiSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."AiSettings"
    ADD CONSTRAINT "AiSettings_pkey" PRIMARY KEY (id);


--
-- Name: AiTrainingDocument AiTrainingDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."AiTrainingDocument"
    ADD CONSTRAINT "AiTrainingDocument_pkey" PRIMARY KEY (id);


--
-- Name: Amenity Amenity_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."Amenity"
    ADD CONSTRAINT "Amenity_pkey" PRIMARY KEY (id);


--
-- Name: AnalyticsConfig AnalyticsConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."AnalyticsConfig"
    ADD CONSTRAINT "AnalyticsConfig_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: ChatSession ChatSession_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."ChatSession"
    ADD CONSTRAINT "ChatSession_pkey" PRIMARY KEY (id);


--
-- Name: CtaBar CtaBar_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."CtaBar"
    ADD CONSTRAINT "CtaBar_pkey" PRIMARY KEY (id);


--
-- Name: Dining Dining_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."Dining"
    ADD CONSTRAINT "Dining_pkey" PRIMARY KEY (id);


--
-- Name: Language Language_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."Language"
    ADD CONSTRAINT "Language_pkey" PRIMARY KEY (id);


--
-- Name: Media Media_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_pkey" PRIMARY KEY (id);


--
-- Name: MeetingRoom MeetingRoom_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."MeetingRoom"
    ADD CONSTRAINT "MeetingRoom_pkey" PRIMARY KEY (id);


--
-- Name: MenuItem MenuItem_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY (id);


--
-- Name: PageView PageView_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."PageView"
    ADD CONSTRAINT "PageView_pkey" PRIMARY KEY (id);


--
-- Name: Page Page_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."Page"
    ADD CONSTRAINT "Page_pkey" PRIMARY KEY (id);


--
-- Name: Room Room_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT "Room_pkey" PRIMARY KEY (id);


--
-- Name: SiteSettings SiteSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_pkey" PRIMARY KEY (id);


--
-- Name: VisitorAction VisitorAction_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."VisitorAction"
    ADD CONSTRAINT "VisitorAction_pkey" PRIMARY KEY (id);


--
-- Name: Widget Widget_pkey; Type: CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."Widget"
    ADD CONSTRAINT "Widget_pkey" PRIMARY KEY (id);


--
-- Name: AdminUser_email_key; Type: INDEX; Schema: public; Owner: coolify
--

CREATE UNIQUE INDEX "AdminUser_email_key" ON public."AdminUser" USING btree (email);


--
-- Name: Language_code_key; Type: INDEX; Schema: public; Owner: coolify
--

CREATE UNIQUE INDEX "Language_code_key" ON public."Language" USING btree (code);


--
-- Name: Page_slug_locale_key; Type: INDEX; Schema: public; Owner: coolify
--

CREATE UNIQUE INDEX "Page_slug_locale_key" ON public."Page" USING btree (slug, locale);


--
-- Name: SiteSettings_locale_key; Type: INDEX; Schema: public; Owner: coolify
--

CREATE UNIQUE INDEX "SiteSettings_locale_key" ON public."SiteSettings" USING btree (locale);


--
-- Name: ChatMessage ChatMessage_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."ChatSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MenuItem MenuItem_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Widget Widget_pageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: coolify
--

ALTER TABLE ONLY public."Widget"
    ADD CONSTRAINT "Widget_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES public."Page"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZdFPziSjlomAIH9rT3oLe0Y1HJf3Xg1TJAVbJKVqRGPXzdfH32wBicGbbLAN6Jl

