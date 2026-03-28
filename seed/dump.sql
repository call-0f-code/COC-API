--
-- PostgreSQL database dump
--


-- Dumped from database version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Supabase internal commands removed to ensure compatibility with local seeding

-- Simplified seed SQL for local development
-- Creates core tables and inserts up to 30 members and some relations.

CREATE SCHEMA IF NOT EXISTS realtime;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;

BEGIN;

-- Drop existing tables and types (simple ordering)
DROP TABLE IF EXISTS public."_prisma_migrations" CASCADE;
DROP TABLE IF EXISTS public."MemberProject" CASCADE;
DROP TABLE IF EXISTS public."MemberAchievement" CASCADE;
DROP TABLE IF EXISTS public."CompletedQuestion" CASCADE;
DROP TABLE IF EXISTS public."InterviewExperience" CASCADE;
DROP TABLE IF EXISTS public."Question" CASCADE;
DROP TABLE IF EXISTS public."Topic" CASCADE;
DROP TABLE IF EXISTS public."Project" CASCADE;
DROP TABLE IF EXISTS public."Achievement" CASCADE;
DROP TABLE IF EXISTS public."Account" CASCADE;
DROP TABLE IF EXISTS public."Member" CASCADE;
DROP TABLE IF EXISTS realtime.schema_migrations CASCADE;
DROP TABLE IF EXISTS auth.users CASCADE;

DROP TYPE IF EXISTS public."Difficulty" CASCADE;
DROP TYPE IF EXISTS public."Verdict" CASCADE;

-- Enum types
CREATE TYPE public."Difficulty" AS ENUM (
    'Easy',
    'Medium',
    'Hard'
);

CREATE TYPE public."Verdict" AS ENUM (
    'Selected',
    'Rejected',
    'Pending'
);

CREATE TABLE IF NOT EXISTS realtime.schema_migrations (
    version TEXT,
    inserted_at TIMESTAMP WITH TIME ZONE
);


-- Member table
CREATE TABLE public."Member" (
    id UUID,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    birth_date DATE,
    phone TEXT,
    bio TEXT,
    "profilePhoto" TEXT,
    github TEXT,
    linkedin TEXT,
    twitter TEXT,
    geeksforgeeks TEXT,
    leetcode TEXT,
    codechef TEXT,
    codeforces TEXT,
    "passoutYear" DATE,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isManager" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "approvedById" UUID
);

-- Account
CREATE TABLE public."Account" (
    id UUID,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    password TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "memberId" UUID
);

-- Achievement
CREATE TABLE public."Achievement" (
    id SERIAL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "achievedAt" DATE NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdById" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedById" UUID,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- MemberAchievement (join)
CREATE TABLE public."MemberAchievement" (
    "memberId" UUID,
    "achievementId" INTEGER
);

-- Project
CREATE TABLE public."Project" (
    id SERIAL,
    name TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "deployUrl" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedById" UUID,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- MemberProject (join)
CREATE TABLE public."MemberProject" (
    "memberId" UUID,
    "projectId" INTEGER
);

-- Topic
CREATE TABLE public."Topic" (
    id SERIAL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "createdById" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedById" UUID,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Question
CREATE TABLE public."Question" (
    id SERIAL,
    "questionName" TEXT NOT NULL,
    difficulty public."Difficulty" NOT NULL,
    link TEXT NOT NULL,
    "topicId" INTEGER,
    "createdById" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedById" UUID,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- InterviewExperience
CREATE TABLE public."InterviewExperience" (
    id SERIAL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    verdict public."Verdict" NOT NULL,
    content TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "memberId" UUID
);

-- CompletedQuestion (join)
CREATE TABLE public."CompletedQuestion" (
    "memberId" UUID,
    "questionId" INTEGER
);

-- _prisma_migrations
CREATE TABLE public."_prisma_migrations" (
    id TEXT,
    checksum TEXT NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    migration_name TEXT NOT NULL,
    logs TEXT,
    rolled_back_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    applied_steps_count INTEGER DEFAULT 0
);

-- (Enum types moved to top of file, before CREATE TABLE statements)

INSERT INTO public."Account" (id, provider, "providerAccountId", password, "accessToken", "refreshToken", "expiresAt", "createdAt", "updatedAt", "memberId") VALUES
('e882157d-fc39-49e0-9df9-99ca0adb8a7c', 'vedant@gmail.com', '$2b$10$eH5Xpk0e88tWULMgIMJdqeAPE3ND9qych/bfGeh7MM3tFbXX90sF.', NULL, NULL, NULL, NULL, '2025-07-27 12:36:07.398', '2025-07-27 12:36:07.398', '738b73b4-0725-4f7c-95bf-cbdb72eb4e84'),
('0b121686-c462-4fae-8324-b88316013243', 'bhaven@gmail.com', '$2b$10$irh3xCai75iDsLKfp8TJPeEMA2pfFHpIqIqkCAezNjvs25HV13vSy', NULL, NULL, NULL, NULL, '2025-07-27 12:42:51.984', '2025-07-27 12:42:51.984', '86237b63-1339-49d6-ad57-1d4b93bd5092'),
('8b8d3535-1592-4673-ab98-5c41e7899932', 'shaheen@gmail.com', '$2b$10$psuckT2vhmGq3ngd9L5PMOg/ACk/qg7wH.060RqBhs9YcP0j23w4S', NULL, NULL, NULL, NULL, '2025-07-27 12:49:37.408', '2025-07-27 12:49:37.408', '3e6666f5-8ad9-4686-8656-a6904360d4ba'),
('0d95b051-0a15-4811-84ed-e0b67a57dcbb', 'sanskar@gmail.com', '$2b$10$ajN/.3Jdvb78aGo/HKY9suTqrwozl4VFbrpz9BTFRarVnKBkb3QBO', NULL, NULL, NULL, NULL, '2025-07-27 12:53:26.146', '2025-07-27 12:53:26.146', '855fb554-02f7-4b6a-a17e-d55b7976babf'),
('36fc123d-0f51-4373-aa9c-a2db94cbaf6c', 'eshwar@gmail.com', '$2b$10$boqMJ//X86GNTKG4uG4yV.ibMMi1U43iz2MwYiwUgPwYcBCDPNjf6', NULL, NULL, NULL, NULL, '2025-07-27 13:00:38.612', '2025-07-27 13:00:38.612', '03a1a0f8-c1b9-4ac1-99d9-f10f26a82f7c'),
('a895aacf-aabe-4d0d-9d42-5a463061d45c', 'yash@gmail.com', '$2b$10$zonROajObqXYsiDX1UuYou6Pms.qvS4hxiR4Ehm5bTHT6MT.n8xmW', NULL, NULL, NULL, NULL, '2025-07-27 13:03:03.733', '2025-07-27 13:03:03.733', '0cc29a18-180c-408d-9cbe-0fc06109a5c1'),
('0ece4d7c-6a17-4d5f-8e57-2dddb8f1cc12', 'prathamesh@gmail.com', '$2b$10$KaF.GZydyvWUTb.Pk85APuVCh66sZ/uY3/3heTYUAhnQdoHThKVpG', NULL, NULL, NULL, NULL, '2025-07-27 13:04:35.928', '2025-07-27 13:04:35.928', 'bf152df5-3c23-4c1c-85aa-212e0487b420'),
('89c4d268-131f-439d-9ebd-02082af93c2f', 'pratik@gmail.com', '$2b$10$0PDGCKCKSuC5d0aJ4SyoReJjrMuRjUdNPRjSUVxJcYRACcKWu0TT6', NULL, NULL, NULL, NULL, '2025-07-27 13:05:30.243', '2025-07-27 13:05:30.243', 'ac713749-77c1-46b6-ae82-f16d616b1c7c'),
('94023539-b795-4504-85de-f4dd89362884', 'swaraj@gmail.com', '$2b$10$pH/8h6.Ic.jFy0vusM/au.1VCe.Sl37GBtrAR99eNxl7GxPS7Asxa', NULL, NULL, NULL, NULL, '2025-07-27 13:11:28.79', '2025-07-27 13:11:28.79', '1404e81c-d567-4103-941b-0abeea7fc049'),
('b95dc5ec-e7a2-4689-b0c3-2247db3b3c23', 'vansh@gmail.com', '$2b$10$eq6f05tX/ZMwWm2gkxNJnOhfr3m.zYW23eY4TTiIVDvAOE03RZS.6', NULL, NULL, NULL, NULL, '2025-07-27 13:12:10.092', '2025-07-27 13:12:10.092', '22ba7f7a-14e7-45fa-bf5f-51d5f015496f'),
('0a667c9f-e611-4d58-bd2d-1a65860fcc97', 'shivaji@gmail.com', '$2b$10$LHj6GmVwPH0.YHU3wSVLf.PK2cQ23swfr6MoI3hFxp4tInDDLnwu2', NULL, NULL, NULL, NULL, '2025-07-27 13:13:07.284', '2025-07-27 13:13:07.284', '8eeacf82-18e5-48f8-a11e-fdbbe2eb81ce'),
('edd6063c-a60f-4653-8512-f21973ab5879', 'sanica@gmail.com', '$2b$10$QlXDLQeKvVeRyA9r2.MC8umgGR.GF343BUrFtX2KSg8gUo92bFGZW', NULL, NULL, NULL, NULL, '2025-07-27 13:20:15.287', '2025-07-27 13:20:15.287', '644b5e8f-910d-450e-a855-a88f31d02b7b'),
('7e78693b-d788-4e17-aa87-94e631cee02e', 'aditya@gmail.com', '$2b$10$W4aJemPA5H/Ws1rUuC.Kge8/fhLXJE2eTTKh6x.wksQ4Z35waZmkW', NULL, NULL, NULL, NULL, '2025-07-27 13:21:05.854', '2025-07-27 13:21:05.854', '1ff4b36d-5671-4855-8476-d0a8993f9873'),
('a524c15b-3a24-484d-947d-b440aa5fa4f3', 'sarvesh@gmail.com', '$2b$10$6F4VAW1PAOwRYvXbM14Cd.XMvI61neTdp.54qXVze/r.GwF/bWseS', NULL, NULL, NULL, NULL, '2025-07-27 13:29:39.074', '2025-07-27 13:29:39.074', 'ad525dce-67dd-4878-ab95-068943923b81'),
('d754025d-f04a-489f-9cd3-a863e3a2083b', 'Mukul@gmail.com', '$2b$10$gsbswEwuP3LEY6mUg3WHUu3qfeDe7S2KLHvv.ibMTEIlwNqLJPl9u', NULL, NULL, NULL, NULL, '2025-07-27 13:36:08.586', '2025-07-27 13:36:08.586', '1b482f80-f649-45f9-a90b-7538a7a6e66e'),
('1fc11447-d4b2-44ac-9bc8-76f841f11d15', 'anushka@gmail.com', '$2b$10$lAn7dozXDFFKzmD2SovmF.MXRKChjy7EqzV/REdPokjNvbfBoJdHa', NULL, NULL, NULL, NULL, '2025-07-27 13:37:18.144', '2025-07-27 13:37:18.144', 'b6f44922-fff3-48eb-a0c9-15d41e786e38'),
('c577b0c8-ad80-46b9-bb57-03a39f740157', 'samarth@gmail.com', '$2b$10$NbmkATGYbJckgOs.rIkVIetZXCAv0jdyNbo075Kp.ybgDR2MySHIq', NULL, NULL, NULL, NULL, '2025-07-27 13:41:04.035', '2025-07-27 13:41:04.035', '1b5933a9-5d50-4246-861a-ca0d30bd581f'),
('102d22ea-192b-400f-bdce-dac29abeb49b', 'vaishnavi@gmail.com', '$2b$10$wTra4lS7IrfMWPJiMc/V9u8YDZJg5.2mIWmD8ZNyvbt07JPmako/S', NULL, NULL, NULL, NULL, '2025-07-27 13:42:05.112', '2025-07-27 13:42:05.112', 'd46a667d-5b68-4b82-9de7-fcfdf0ab0181'),
('1f24974e-5ffe-4655-94e8-282f3266bb7d', 'vaishnaviadhav@gmail.com', '$2b$10$CvBVhnqFPq3s5f6q2VYCuOVZtuZloaBduLuloZwERvS3CGJOo3nnG', NULL, NULL, NULL, NULL, '2025-07-27 13:43:26.945', '2025-07-27 13:43:26.945', '7dd07cc1-08da-48cc-a162-f546356fe291'),
('78e6f26b-dd53-440e-96c1-f4d2205fab87', 'sakshi@gmail.com', '$2b$10$TdCn5HveTLvSoIdFMR1n/eJGKLofoFXx5lQCsEEQU0GnyZrdp9qkC', NULL, NULL, NULL, NULL, '2025-07-27 13:44:46.419', '2025-07-27 13:44:46.419', '259a1e70-c093-43d4-8aa1-bba058a896b8'),
('c0c097c3-c2dc-4ded-8a82-2e718eb46eff', 'piyushaa@gmail.com', '$2b$10$GkiaYm.5cG73HgDAANN6xedU/zqzvmz1JVsoC1C6/jmCXM67shOSG', NULL, NULL, NULL, NULL, '2025-07-27 13:46:17.354', '2025-07-27 13:46:17.354', '46cfa3aa-1efe-4cc6-a624-340808ef7cb8'),
('bea77f0d-37f6-4303-b549-93846e36d774', 'siddhesh@gmail.com', '$2b$10$TcfZ9HVPsTNARAk31CwbxeAIn7gADgfQ1E2cF/8AgeCh7dRSY/xfi', NULL, NULL, NULL, NULL, '2025-07-27 13:47:45.957', '2025-07-27 13:47:45.957', 'a8443783-dd59-446a-93f5-19f5e590e88b'),
('e43283f2-13d9-4a1b-a505-deb2d4f8b967', 'aarya@gmail.com', '$2b$10$C3yPZHUkWOpgXDNFNYuRf.OSSz.RhpQI03T1IwdgiH/bqyl6rvCw2', NULL, NULL, NULL, NULL, '2025-07-27 13:56:12.936', '2025-07-27 13:56:12.936', 'db2bd9ec-25e5-4134-ae53-fea1734ca161'),
('07c9e6e0-7f65-4494-9764-c7d1c258fd75', 'shashwati@gmail.com', '$2b$10$Xb45AKKbCU8ma95Me6Yc7u5nmmX.OGnkShA4CKgInaw9On6XhFLEy', NULL, NULL, NULL, NULL, '2025-07-27 13:57:15.237', '2025-07-27 13:57:15.237', 'c5b2470d-7fb4-4c93-bfe2-fedc00415dc2'),
('2cf94aa7-3790-4758-b83d-66e762b2505d', 'suhani@gmail.com', '$2b$10$a8QFdX9ws02jnsUz4O1DdehSDJjhRvX96fuUxJIjZHoFlhfzMRkYq', NULL, NULL, NULL, NULL, '2025-07-27 13:58:46.809', '2025-07-27 13:58:46.809', '329d6d7a-9787-452e-9c0c-506481c5462a'),
('f48da39b-98fd-481a-bbd6-68c10be660d0', 'sarveshshiralkar@gmail.com', '$2b$10$7V9FuR7rpABeRvbMuU4bUeoMQKQXrehykMmvzrXarIsLuJKNa1tl.', NULL, NULL, NULL, NULL, '2025-07-27 14:02:16.734', '2025-07-27 14:02:16.734', 'd7c96d3c-d45d-4bde-8c2b-39f0451a389f'),
('2074b920-4329-4e6f-9798-07b372a6679c', 'sahillakare@gmail.com', '$2b$10$XJ.r8SaroRak1GUyVIoXj.oBCYMW1regaZVHBlP1lWLc50WyYSovW', NULL, NULL, NULL, NULL, '2025-07-27 14:07:23.722', '2025-07-27 14:07:23.722', '516af252-e8dc-48a4-80c4-5af1e0758e58'),
('7e4be315-6cd3-410f-8083-fe49f9c2305c', 'sachin@gmail.com', '$2b$10$4EiXQeSIWLAsaY.4ThRyR.Dmpt3Yo5ezPrV9re7wcES8KG7QHTmB2', NULL, NULL, NULL, NULL, '2025-07-27 14:28:15.082', '2025-07-27 14:28:15.082', '6c968bfa-ebf8-4b2b-a349-36bbc9cc2870'),
('3891d5cf-1c51-4245-9a78-81b28ce13266', 'sherin@gmail.com', '$2b$10$NvZJXjKUK2IOMzC3raJvi.9bIYUgEWH69ST9pHbbcrJyMmAJm4HIS', NULL, NULL, NULL, NULL, '2025-07-27 16:57:39.729', '2025-07-27 16:57:39.729', 'd7d54e46-8db2-449c-87f9-8e89e8537c42'),
('101d1b9b-743e-4930-830e-9a33c0429199', 'shruti@gmail.com', '$2b$10$ZuuiwH/L3Aal9jBCDO9qsuZLd6lRZz6rPCMQWIr2bAnM33oMUfsVa', NULL, NULL, NULL, NULL, '2025-07-27 17:18:51.245', '2025-07-27 17:18:51.245', 'c494d747-5123-457f-b9cf-f3359f5a0fe8'),
('f121b746-6942-4013-a11b-178571ed988e', 'shivam@gmail.com', '$2b$10$L5c9yXrvfgLjEQ4y7yLSseLhafRXbYPiOkoWt//rwj1h6f80PdnnC', NULL, NULL, NULL, NULL, '2025-07-27 17:32:16.949', '2025-07-27 17:32:16.949', '75ef229a-3770-46aa-adc8-f4d250c6ac81'),
('ab673cb2-cbb2-4129-a2af-1d911cd981d1', 'veda@gmail.com', '$2b$10$oHbUZdsrcq6tk9lUyKsFeuCLDEzpbdrPzN9/nL8BcUSFB3FbTJvPe', NULL, NULL, NULL, NULL, '2025-07-27 18:06:53.921', '2025-07-27 18:06:53.921', '64464cc4-4dfc-4522-a256-6aca2371df7f'),
('3195836d-c300-4406-bb40-7e6e665ac9a9', 'sheryash@gmail.com', '$2b$10$wdVUVGhmuykY.tdcEYNHU.8jjskz/U0JXw/XHh8OOgir4c2qux/3q', NULL, NULL, NULL, NULL, '2025-07-27 18:28:45.633', '2025-07-27 18:28:45.633', '046d352f-10d9-49b5-bbed-31d67bf4b583'),
('16423861-0e69-4a67-84f0-383dbfca9bd8', 'prajakta@gmail.com', '$2b$10$JXImJtLR3SblUWGxAMF.6.VHetvNMKcoNOMF4BAkAKDsXHK/TU0rC', NULL, NULL, NULL, NULL, '2025-07-27 18:32:27.558', '2025-07-27 18:32:27.558', '0b83d3e3-8685-4cfe-9f63-6cc22c1ceae4'),
('5bf224bd-cd63-41d7-950d-7c66725dd7a6', 'harsh@gmail.com', '$2b$10$ND15qcpzkY3t7lg5gZx4CuPs5XWP3OsT7.9x2/ODf7tGo6AvZuMDm', NULL, NULL, NULL, NULL, '2025-07-27 18:37:17.457', '2025-07-27 18:37:17.457', 'cffc47fb-1147-4dd5-9818-21d209dbe3f3'),
('e2e31f9d-1321-4c7e-98f6-fdb004cd0f27', 'Abhiram@gmail.com', '$2b$10$gOz6M.O48PwsBmvv4AsdLuHkArwIKNSspySKaAmEdkBy5by.s1Clm', NULL, NULL, NULL, NULL, '2025-07-27 18:41:32.941', '2025-07-27 18:41:32.941', 'e68ca856-978b-4bb5-a2f1-6497278624bb'),
('55badea7-0c98-4d18-a2a6-f54d15a12afc', 'aryan@gmail.com', '$2b$10$atDdFN1RzGh0ixzo8AAqjuLoIScI1DFhc1/y620fDg9.iKBL/K0AS', NULL, NULL, NULL, NULL, '2025-07-27 18:47:08.087', '2025-07-27 18:47:08.087', '48724979-f9c8-46de-b9ab-9ca0186596d0'),
('4e428487-f19d-476f-ab27-10e9577e98fd', 'shubham@gmail.com', '$2b$10$4pmoJTrSIDrfYS4t0sqql..MZXu0K5f1FA1hSJ7cf4VGsBkYDWqxi', NULL, NULL, NULL, NULL, '2025-07-27 18:49:15.105', '2025-07-27 18:49:15.105', '69394246-3e41-4eb5-812a-48801b0b5f3e'),
('5aca50b8-f251-4632-834d-3f4e92ef6c9c', 'komal@gmail.com', '$2b$10$hf21ih62PzTbX6ba4VaZAeBLrBLwwdbkXsvDfT5swq0CPd/EsIP.a', NULL, NULL, NULL, NULL, '2025-07-27 19:29:30.114', '2025-07-27 19:29:30.114', 'ef59db8b-2ad5-4e0a-b741-f58521bf61ec'),
('ab59bbd5-d03f-41fe-8267-5697d2d7774a', 'sahil@gmail.com', '$2b$10$lMayDbHFuV3p.xSULly1zOoLhWOlgPaQoVDykm3TG12RcXTSoZfua', NULL, NULL, NULL, NULL, '2025-07-27 19:42:25.794', '2025-07-27 19:42:25.794', 'f032f524-c153-496f-9eea-e2ff8622f3d1'),
('ceb3abbe-ec03-4531-9434-3265e5d1f141', 'dillip@gmail.com', '$2b$10$3o.97fG5vAcS3WJAmy9MbOMyU9yUDXkZMOHtMhQ4vbV5P757F5Z2G', NULL, NULL, NULL, NULL, '2025-07-27 19:47:56.176', '2025-07-27 19:47:56.176', '20ee0910-36b3-48d6-ad96-2112d02fd9b6'),
('229a9b54-94ec-4164-87a8-abe852079016', 'harish@gmail.com', '$2b$10$C2V0fELssTODLmt6AjO53eLTqT51C8ga.JyT4bTgFrajpB.37OvT.', '$2b$10$C2V0fELssTODLmt6AjO53eLTqT51C8ga.JyT4bTgFrajpB.37OvT.', NULL, NULL, NULL, '2025-07-27 20:43:23.073', '2025-07-27 20:43:23.073', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('50317f35-cd52-4a05-8641-52abf9736c2a', 'credentials', 'yourmom@gmail.com', '$2b$08$M63.zOUte/5o2DLUAMxgJOK/VOyVy2CQF61XucPcuTZWd80hZBLG.', NULL, NULL, NULL, '2025-10-27 20:12:59.287', '2025-10-27 20:12:59.287', 'a6bc0b3a-71bf-4e0d-8879-ddedbbc0a766'),
('bc3b8b6c-b292-46b6-96bf-48168d6a7c21', 'credentials', 'hello123@gmail.com', '$2b$08$tY.I//asON4Xxci0ANDuLeEVzysjnPDoBynffnYrsVIfUbzksWXNS', NULL, NULL, NULL, '2025-11-20 09:01:14.333', '2025-11-20 09:01:14.333', '92f0e65d-f306-4cdd-baad-059f645cf148'),
('d696a095-96fc-44af-8daa-f9afb01049ba', 'credentials', 'syswraith@gmail.com', '$2b$08$tFFZNuza5BopfhggwSR7zuedbc9O9egCZ/NGwEXLAEr.iEi/nIMAK', NULL, NULL, NULL, '2025-10-27 14:57:14.684', '2025-10-27 14:57:14.684', '207bb8bd-3e48-40c8-83ce-a825cb9fe474');


--
-- Data for Name: Achievement; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Achievement" (id, title, "achievedAt", "imageUrl", "createdAt", "createdById", description, "updatedAt", "updatedById") VALUES
('14', 'Winner At BMCC''s Troika 2025 Coding Event', '2025-02-04 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/2dd9eb5c-66c6-4c8d-b978-0e671a243c76.jpeg', '2025-07-27 19:39:03.77', 'd7d54e46-8db2-449c-87f9-8e89e8537c42', 'On 4th February 2025, the team secured the winner position at BMCC''s Troika 2025 Coding Event, demonstrating outstanding innovation and technical excellence.', '2025-07-27 19:39:03.77', NULL),
('3', 'Runner-Up At Jigyasa Coding Competition', '2024-02-10 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/67235c1c-6573-40af-994c-f38138d0e175.jpeg', '2025-07-27 17:27:07.721', 'd7d54e46-8db2-449c-87f9-8e89e8537c42', 'On 10th February 2024, Vansh Waldeo secured the runner-up position in a prestigious coding competition held at IMCC, Pune.', '2025-07-27 18:10:15.82', 'd7d54e46-8db2-449c-87f9-8e89e8537c42'),
('4', 'Runner Up BITS PILANI POSTMAN API Hackathon 3.0', '2023-01-08 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/97d19654-7002-4f76-ba6c-e38bfa958d8e.png', '2025-07-27 18:36:06.816', '1b5933a9-5d50-4246-861a-ca0d30bd581f', 'Secured Runner-Up position in the BITS Pilani Postman API Hackathon 3.0, an online event centered around solving real-world problems through effective API design and collaboration. Showcased strong skills in building, testing, and integrating APIs using Postman.', '2025-07-27 18:36:06.816', NULL),
('5', 'Runner Up IXPLORER WEB DESIGN & DEVELOPMENT HACKATHON', '2023-11-27 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/1bcc40eb-3916-466a-baf4-7e4ed69ca6e8.jpeg', '2025-07-27 18:49:57.866', '1b5933a9-5d50-4246-861a-ca0d30bd581f', 'Secured Runner-Up position in the IXplorer Web Design & Development Hackathon, an online hackathon organized by IIT Patna. Built a creative and functional web application, showcasing strong skills in full-stack development and user-centered design.', '2025-07-27 18:49:57.866', NULL),
('6', 'Runner Up At Zeal Institute''s Web Development Project Competition', '2025-04-12 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/57de0ddc-322e-4c1f-a91b-b0c4a1acc8db.jpeg', '2025-07-27 18:51:38.653', 'd7d54e46-8db2-449c-87f9-8e89e8537c42', 'On 12th April 2025, the team secured the runner-up position at Zeal Institute''s Web Development Project Competition, showcasing innovation and strong technical skills.', '2025-07-27 18:51:38.653', NULL),
('9', 'Winner At MKSSS Cummins College of Engineering CodeBid Event', '2025-04-05 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/f39c95ca-ca7e-4138-9ac4-0d9cdfdb0cb5.jpeg', '2025-07-27 19:12:45.321', 'd7d54e46-8db2-449c-87f9-8e89e8537c42', 'On 5th April 2025, the team secured the winner position at MKSSS Cummins College of Engineering''s CodeBid event, demonstrating outstanding innovation and technical excellence.', '2025-07-27 20:02:49.514', 'd7d54e46-8db2-449c-87f9-8e89e8537c42'),
('11', 'Runner Up Smart India Hackathon 2023', '2023-12-26 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/26bce2c2-9603-4b99-8868-abfeb15ed07f.jpeg', '2025-07-27 19:24:19.865', '1b5933a9-5d50-4246-861a-ca0d30bd581f', 'Crowned Winner at Smart India Hackathon 2023 for developing an AI-powered women safety solution. Our model could detect distress situations in real time and send instant alerts, showcasing innovation, social impact, and strong technical execution.', '2025-07-27 19:24:19.865', NULL),
('12', 'Winner At Hunar Intern Web Development Hackathon', '2024-08-26 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/d982a872-e4c9-4b1d-8af9-91cbc0e2f2d1.jpeg', '2025-07-27 19:26:23.925', 'd7d54e46-8db2-449c-87f9-8e89e8537c42', 'On 26th August 2024, the team secured the winner position at Hunar Intern''s Web Development Hackathon, demonstrating outstanding innovation and technical excellence.', '2025-07-27 19:42:06.922', 'd7d54e46-8db2-449c-87f9-8e89e8537c42'),
('15', 'Consecutive COEP MindSpark Finalists 2023 & 2024 ', '2024-09-23 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/03379229-271c-4e7a-b09e-9dbbaedc894c.jpeg', '2025-07-27 19:50:25.906', '1b5933a9-5d50-4246-861a-ca0d30bd581f', 'Achieved finalist positions two years in a row at COEP MindSpark, Pune’s premier techfest, competing among hundreds of participants. Selected in the top 10 for WebScape (2023) and Retracer (2024), showcasing standout skills in web development, problem-solving, and technical creativity.', '2025-07-27 19:50:25.906', NULL),
('7', 'Winner At Zeal Institute''s Web Development Project Competition', '2025-04-12 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/04c4131b-56a7-46d1-a6e0-797e095a33b6.jpeg', '2025-07-27 18:58:46.02', 'd7d54e46-8db2-449c-87f9-8e89e8537c42', 'On 12th April 2025, the team secured the winner position at Zeal Institute''s Web Development Project Competition, demonstrating outstanding innovation and technical excellence.', '2025-07-27 18:58:46.02', NULL),
('10', 'Finalist Meher Baba Drone Competition', '2022-02-13 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/ac141a2e-07f5-42f2-a5a2-6195d22f15a7.jpeg', '2025-07-27 19:16:06.848', '1b5933a9-5d50-4246-861a-ca0d30bd581f', 'Selected as a Finalist in the Meher Baba Drone Competition, showcasing innovative solutions in drone technology and aerial system design. Recognized for technical creativity, problem-solving, and practical implementation in a competitive national setting.', '2025-07-29 11:57:51.485', 'd7d54e46-8db2-449c-87f9-8e89e8537c42'),
('13', 'Runner Up Smart India Hackathon 2024', '2024-12-12 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/d99c3eae-831d-4043-90a8-4f15d9970d65.jpeg', '2025-07-27 19:27:03.366', '1b5933a9-5d50-4246-861a-ca0d30bd581f', 'Secured Runner-Up position at Smart India Hackathon 2024, a prestigious national-level innovation challenge. Built an AI-powered virtual therapy platform for individuals with speech impairments, promoting accessible and inclusive mental health support.', '2025-07-27 19:27:03.366', NULL),
('8', 'Runner Up At Clash of CSS NIT Kurukshetra', '2023-11-30 00:00:00', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/achievements/a6a92603-a4a9-4ea8-9afe-f1473f0b21ab.jpeg', '2025-07-27 19:09:12.806', '1b5933a9-5d50-4246-861a-ca0d30bd581f', 'Runner Up at the Clash of CSS Hackathon organized online by NIT Kurukshetra.\nWorked in a team of three to design a visually appealing, responsive frontend interface under time constraints, demonstrating strong UI/UX skills and effective collaboration.', '2025-07-27 19:09:12.806', NULL);


--
-- Data for Name: CompletedQuestion; Type: TABLE DATA; Schema: public; Owner: -
--

-- Empty COPY for public."CompletedQuestion" ("memberId", "questionId") removed


--
-- Data for Name: InterviewExperience; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."InterviewExperience" (id, company, role, verdict, content, "isAnonymous", "memberId") VALUES
('33', 'Grinder', 'Sword Department', 'Pending', 'I got selected because of my skills with my sword ( i am revealing my identity)', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('6', 'Google', 'Software Engineering', 'Rejected', '"<ol><li><p>I SUCK</p></li></ol><p></p>"', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('7', 'Amazon', 'Engineer', 'Selected', '<p><strong>I ROCK  </strong><br><code>i SHINE</code></p><p><em>I AM THE BEST</em></p><h1>I AM HUGE</h1><p><s>FABULOUS IS MY MIDDLE NAME</s></p><p></p>', 'true', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('8', 'TCS', 'Prime', 'Pending', '<p><em>IF YOU BECAME PREGNANT ON THE DAY OF YOUR TCS INTERIVEW THEN BY THE TIME YOU GET YOUR INTERVIEW RESULT YOUR FETUS WOULD HAVE DEVLEOPED THE ABILITY TO OPEN ITS EYES, LITERAL EYES DEVELOP IN LESS TIME THAN THESE PEOPLE NEED TO TELL YOU WHETHER YOU HAVE A JOB OR NOT</em></p>', 'true', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('10', 'Meta', 'Floor sweeper', 'Rejected', '# how tf did I mess this up man\n\n*It was literally a floor sweeping job*\n\n### I even showed my floor coding skills by creating a program that does `print("I am floor sweeper!!!")`\n\n> Honestly I am quite impressed that someone can fail an interveiw for this job\n\n      -my interviewer\n\nThe job requirements:\n\n\n1. Know how to walk\n2. Know how to hold a mop\n3. Know how to use it on the floor \n\nWhen I asked them why I failed they gave the following evaluation:\n\n\n- The candidate came with a hatsune miku themed mop that had "my waifu helps me clean" on it \n- He was constantly staring at the breasts of female as well as male interviewers (while licking lips)\n- When asked for an explaination for the "I love pedophilia" tshirt that the candidate was sporting, he went on a 30 minute tirade on the topic of **"Old enough to swear, then my children she can bear"**\n\n**idk man just sounds very unreasonable if you ask me :(**\n\n', 'true', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('12', 'call of code', 'President', 'Rejected', 'How tf did I get rejected for a job I already had 😭', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('13', 'xyz', 'asdf', 'Pending', '> asdfasdfasdf', 'true', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('14', 'asdf', 'asdf', 'Selected', '`&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;-dsfasdf`', 'true', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('15', 'asdf', 'qwer', 'Pending', '                                  sarvesh', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('16', 'xvbasdf', 'l;sjdfl;jasdf', 'Pending', 'asdfasdfasdfasdfasdfasdf', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('17', 'Deolitte', 'SDE1', 'Selected', 'Guys i got selected the techical rounds were easy**&#32;**', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('18', 'Human Inc', 'Ex-Kitten', 'Selected', 'Moo. I mean, Mew.', 'true', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('19', 'Company', 'SDE', 'Selected', 'Yeahhhhhhhhh i got selected', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('11', 'Netflix', 'floor sweeper', 'Rejected', '# how tf did I mess this up man\n\n*It was literally a floor sweeping job*\n\n### I even showed my floor coding skills by creating a program that does `print("I am floor sweeper!!!")`\n\n> Honestly I am quite impressed that someone can fail an interveiw for this job\n\n```\n  -my interviewer\n\n```\n\nThe job requirements:\n\n1. Know how to walk\n2. Know how to hold a mop\n3. Know how to use it on the floor\n\nWhen I asked them why I failed they gave the following evaluation:\n\n- The candidate came with a hatsune miku themed mop that had "my waifu helps me clean" on it\n', 'true', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('20', 'Google', 'Software Engineer', 'Selected', 'Yeah i got selected at Google', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('23', 'aaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'Selected', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('24', 'aabaasaxax', 'aaaa', 'Selected', '1234567cdcs', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('25', 'qwert', 'qwert', 'Selected', 'qwertyuiokjhgfdszxcv', 'true', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('26', 'asdfghjk', 'asdfghj', 'Selected', 'qwerdfghbnss', 'true', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('27', 'qqqqqqqqqq', 'qqqqqqqqqq', 'Selected', 'qqqqqqqqqqqqqqqqqqqqqq', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('28', 'qqqqqqqqqqqqqqq', 'qqqqqqqqqqqqqqqqqqq', 'Selected', 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('29', 'qqqqqqqqqqqqqqq', 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', 'Pending', 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('34', 'qwed', 'ssss', 'Selected', 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('31', 'OnlyFans', 'Content Head', 'Selected', 'Yeahh i got selected because of my content ideas.', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('32', 'Tinder', 'Match Maker', 'Rejected', 'I got rejected because of my dogshit match making skillssss brooooooo', 'false', '77165f92-1a09-407c-987f-0fc9be16fad8');


--
-- Data for Name: Member; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Member" (id, name, email, phone, bio, "profilePhoto", github, linkedin, twitter, geeksforgeeks, leetcode, codechef, codeforces, "passoutYear", "isApproved", "isManager", "createdAt", "updatedAt", "approvedById", birth_date) VALUES
('a6bc0b3a-71bf-4e0d-8879-ddedbbc0a766', 'your mom', 'yourmom@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-01 00:00:00', 'false', 'false', '2025-10-27 20:12:58.862', '2025-10-27 20:12:58.862', NULL, NULL),
('259a1e70-c093-43d4-8aa1-bba058a896b8', 'Sakshi Chaudhari', 'sakshi@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/27b32a1e-2edd-4663-8635-e0cf9c159967.jpeg', 'https://github.com/sakshiatul30', 'https://www.linkedin.com/in/sakshi-chaudhari-536a81324', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'false', 'false', '2025-07-27 13:44:45.59', '2025-09-15 18:34:02.698', '77165f92-1a09-407c-987f-0fc9be16fad8', NULL),
('92f0e65d-f306-4cdd-baad-059f645cf148', 'hello', 'hello123@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'false', 'false', '2025-11-20 09:01:13.485', '2025-11-20 09:01:13.485', NULL, NULL),
('db2bd9ec-25e5-4134-ae53-fea1734ca161', 'Aarya Godbole', 'aaryagodbole550@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/b7d68ce2-87c9-4ea6-9add-4e809b7ae37c.jpeg', 'https://github.com/aaryagodbole', 'https://www.linkedin.com/in/aarya-godbole/', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'false', '2025-07-27 13:56:11.408', '2025-07-27 19:37:09.064', NULL, NULL),
('22ba7f7a-14e7-45fa-bf5f-51d5f015496f', 'Vansh Waldeo', 'vansh@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/b856d400-78ea-4eb4-8f3c-1ffb1eb1b0fa.jpeg', 'https://github.com/VanshKing30', 'https://www.linkedin.com/in/vansh-waldeo-81ab31285/', NULL, NULL, NULL, NULL, NULL, '2025-01-01 00:00:00', 'true', 'false', '2025-07-27 13:12:09.267', '2025-07-27 13:12:09.267', NULL, NULL),
('6c968bfa-ebf8-4b2b-a349-36bbc9cc2870', 'Sachin Barvekar', 'sachin@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/d84017f1-8859-4444-a378-f7591f2c2456.jpeg', NULL, 'https://www.linkedin.com/in/sachin-barvekar-2874481a2/', NULL, NULL, NULL, NULL, NULL, '2025-01-01 00:00:00', 'true', 'false', '2025-07-27 14:28:13.538', '2025-07-27 14:28:13.538', NULL, NULL),
('7dd07cc1-08da-48cc-a162-f546356fe291', 'Vaishnavi Adhav', 'vaishnaviadhav@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/2ed0e256-7b52-4c90-abf1-2c759b4aeaa8.jpeg', 'https://github.com/vaishnavi4049', 'https://www.linkedin.com/in/vaishnavi-adhav-b5b346362', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'false', '2025-07-27 13:43:26.12', '2025-07-27 19:35:31.505', NULL, NULL),
('86237b63-1339-49d6-ad57-1d4b93bd5092', 'Bhaven Rathod', 'bhaven@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/df2e0e37-50e8-435e-92e7-fa2e507ca424.jpeg', NULL, 'https://www.linkedin.com/in/bhaven-rathod/', NULL, NULL, NULL, NULL, NULL, '2025-01-01 00:00:00', 'true', 'false', '2025-07-27 12:42:50.416', '2025-07-27 12:42:50.416', NULL, NULL),
('46cfa3aa-1efe-4cc6-a624-340808ef7cb8', 'Piyushaa Mahajan', 'piyushaa@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/396f4028-0423-45d0-94b4-5222e239d875.jpeg', 'https://github.com/piyushaa20', 'https://www.linkedin.com/in/piyushaa-mahajan-826594323', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'false', '2025-07-27 13:46:16.531', '2025-07-27 19:51:48.667', NULL, NULL),
('a8443783-dd59-446a-93f5-19f5e590e88b', 'Siddhesh Thorat', 'siddhesh@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/1ed6dc74-090b-4cca-9c9a-687b12a5086f.jpeg', 'https://github.com/siddhu9993', 'https://www.linkedin.com/in/d2d-siddhesh/', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'false', '2025-07-27 13:47:44.371', '2025-07-27 13:47:44.371', NULL, NULL),
('329d6d7a-9787-452e-9c0c-506481c5462a', 'Suhani Bhati', 'suhani@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/57bb90b4-817f-4aaf-ab83-6f202e50a1e7.jpeg', 'https://github.com/SuhaniBhati', 'https://www.linkedin.com/in/suhani-bhati-aa528828b', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'false', '2025-07-27 13:58:45.984', '2025-07-27 19:39:11.221', NULL, NULL),
('855fb554-02f7-4b6a-a17e-d55b7976babf', 'Sanskar Darekar', 'sanskar@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/3d832d1b-3d81-481e-a6a3-e9e206c61c65.jpeg', 'https://github.com/sanskar-sd', 'https://www.linkedin.com/in/sanskar-darekar/', NULL, NULL, NULL, NULL, NULL, '2026-01-01 00:00:00', 'true', 'false', '2025-07-27 12:53:25.333', '2025-07-27 19:40:07.915', NULL, NULL),
('738b73b4-0725-4f7c-95bf-cbdb72eb4e84', 'Vedant Bulbule', 'vedant@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/6b61cb98-edc9-4e17-9ef7-6784850b77c7.jpeg', 'https://github.com/Vedantbulbule1223', 'https://www.linkedin.com/in/vedant-bulbule-aiml/', NULL, NULL, NULL, NULL, NULL, '2026-01-01 00:00:00', 'true', 'false', '2025-07-27 12:36:06.689', '2025-07-27 12:36:06.689', NULL, NULL),
('b6f44922-fff3-48eb-a0c9-15d41e786e38', 'Anushka Bendle', 'anushka@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/f71382bc-a6d5-467e-ac77-81e6667ddbd1.jpeg', 'https://github.com/anushkabendle', 'https://www.linkedin.com/in/anushkabendle445', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'false', '2025-07-27 13:37:17.319', '2025-07-27 19:52:42.056', NULL, NULL),
('1b482f80-f649-45f9-a90b-7538a7a6e66e', 'Mukul Dhobale', 'Mukul@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/0c6b2d21-32cd-4cce-96ee-58d1e265dac5.jpeg', 'https://github.com/Mukul306', 'https://www.linkedin.com/in/mukul-dhobale-53b547333', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'false', '2025-07-27 13:36:07.064', '2025-07-27 19:55:31.61', NULL, NULL),
('1b5933a9-5d50-4246-861a-ca0d30bd581f', 'Samarth Lad', 'samarth@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/1f07275c-e0e5-4c66-b068-25c593c263cb.jpeg', 'https://github.com/samrth07', 'https://www.linkedin.com/in/samarth-lad-675b99322/', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'true', '2025-07-27 13:41:03.21', '2025-07-27 19:58:32.541', NULL, NULL),
('3e6666f5-8ad9-4686-8656-a6904360d4ba', 'Shaheen Khan', 'shaheen@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/71310f7a-2dba-4d68-9aef-eb18dc60b1e6.jpeg', 'https://github.com/Shaheen-25', 'https://www.linkedin.com/in/shaheenkhan25', NULL, NULL, NULL, NULL, NULL, '2026-01-01 00:00:00', 'true', 'false', '2025-07-27 12:49:35.89', '2025-07-27 19:34:16.322', NULL, NULL),
('8eeacf82-18e5-48f8-a11e-fdbbe2eb81ce', 'Shivaji Raut', 'shivaji@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/cb24b95d-7ff8-444e-993e-c4dae169a5b2.jpeg', 'https://github.com/shivaji43', 'https://www.linkedin.com/in/shivajiraut/', NULL, NULL, NULL, NULL, NULL, '2025-01-01 00:00:00', 'true', 'false', '2025-07-27 13:13:06.46', '2025-07-27 13:13:06.46', NULL, NULL),
('1404e81c-d567-4103-941b-0abeea7fc049', 'Swaraj Pawar', 'swaraj@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/1d6c896c-7889-4140-81df-6d1d11021b71.jpeg', 'https://github.com/Swaraj-23', 'https://www.linkedin.com/in/swaraj-pawar-webdev/', NULL, NULL, NULL, NULL, NULL, '2025-01-01 00:00:00', 'true', 'false', '2025-07-27 13:11:27.264', '2025-07-27 13:11:27.264', NULL, NULL),
('644b5e8f-910d-450e-a855-a88f31d02b7b', 'Sanica chorey', 'sanica@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/5cfd39ec-9bd1-4414-91f7-c25b2f4b96b7.jpeg', NULL, 'https://www.linkedin.com/in/sanica-chorey-0876b024b/', NULL, NULL, NULL, NULL, NULL, '2025-01-01 00:00:00', 'true', 'false', '2025-07-27 13:20:13.746', '2025-07-27 13:20:13.746', NULL, NULL),
('03a1a0f8-c1b9-4ac1-99d9-f10f26a82f7c', 'Eshwar Varpe', 'eshwar@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/23b3a8c4-5821-43fe-9f91-9e48e43ed1be.jpeg', NULL, 'https://www.linkedin.com/in/eshwar-varpe-37a309246/', NULL, NULL, NULL, NULL, NULL, '2024-01-01 00:00:00', 'true', 'false', '2025-07-27 13:00:37.038', '2025-07-27 13:00:37.038', NULL, NULL),
('0cc29a18-180c-408d-9cbe-0fc06109a5c1', 'Yash Kathane', 'yash@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/5dd11423-a067-4ccb-b24b-1a4c0eb0aed2.jpeg', NULL, 'https://www.linkedin.com/in/yash-kathane-31b3b1215/', NULL, NULL, NULL, NULL, NULL, '2024-01-01 00:00:00', 'true', 'false', '2025-07-27 13:03:02.901', '2025-07-27 13:03:02.901', NULL, NULL),
('ac713749-77c1-46b6-ae82-f16d616b1c7c', 'Pratik Bhoite', 'pratik@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/3dc40d0d-5101-4550-9999-1dc4a4f649c3.jpeg', NULL, 'https://www.linkedin.com/in/pratik-bhoite-839770232/', NULL, NULL, NULL, NULL, NULL, '2024-01-01 00:00:00', 'true', 'false', '2025-07-27 13:05:29.412', '2025-07-27 19:19:08.055', NULL, NULL),
('48724979-f9c8-46de-b9ab-9ca0186596d0', 'Aryan Jadlie', 'aryan@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/a7e96fa8-21af-481d-ad80-dcc6c55b3be2.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-01 00:00:00', 'false', 'false', '2025-07-27 18:47:06.554', '2025-10-15 21:42:34.758', '77165f92-1a09-407c-987f-0fc9be16fad8', NULL),
('69394246-3e41-4eb5-812a-48801b0b5f3e', 'Shubham Tohake', 'shubham@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/22dc88c0-57a4-42ca-913f-7ab9ffd92080.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'false', 'false', '2025-07-27 18:49:14.273', '2025-09-15 18:35:19.025', '77165f92-1a09-407c-987f-0fc9be16fad8', NULL),
('f032f524-c153-496f-9eea-e2ff8622f3d1', 'Sahil Mulani', 'sahil@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/c286bed1-186d-4c3d-aa3c-3fcfc2e33752.jpeg', 'https://github.com/MulaniSahil', 'https://www.linkedin.com/in/sahil-mulani-5b7bba2a8/', NULL, NULL, 'https://leetcode.com/u/mulanisahil/', NULL, NULL, '2026-01-01 00:00:00', 'true', 'false', '2025-07-27 19:42:24.97', '2025-07-28 10:07:00.727', NULL, NULL),
('d46a667d-5b68-4b82-9de7-fcfdf0ab0181', 'Vaishnavi Ambhore', 'vaishnavi@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/c13561c7-cebf-4bad-994e-2370c841720d.jpeg', 'https://github.com/vaish12345678', 'https://www.linkedin.com/in/vaishnavi-ambhore-157131335/', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'false', '2025-07-27 13:42:03.576', '2025-07-27 19:36:06.959', NULL, NULL),
('d7c96d3c-d45d-4bde-8c2b-39f0451a389f', 'Sarvesh Shiralkar', 'sarveshshiralkar@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/84ee8088-de1e-49ab-8bae-e044cf8d7830.jpeg', 'https://github.com/SarveshMS7', 'https://www.linkedin.com/in/sarvesh-shiralkar-69559a326/', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'false', '2025-07-27 14:02:15.223', '2025-07-27 19:41:33.591', NULL, NULL),
('d7d54e46-8db2-449c-87f9-8e89e8537c42', 'Sherin Thomas', 'sherin@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/de491aeb-c096-4995-8428-26b94607d45b.jpeg', 'https://github.com/Sherin-2711', 'https://www.linkedin.com/in/sherin-thomas-644242333', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'true', '2025-07-27 16:57:39.035', '2025-07-27 19:57:11.54', NULL, NULL),
('77165f92-1a09-407c-987f-0fc9be16fad8', 'Harish Narote', 'harish@gmail.com', '8668673365', 'DSA Head of Call Of Code.....', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/bc133101-04d9-457f-8c57-a0b3f7fd683a.jpeg', 'https://github.com/Harish-Naruto', 'https://www.linkedin.com/in/harish-narote-600717339/', NULL, NULL, NULL, NULL, NULL, '2028-01-01 18:30:00', 'true', 'true', '2025-07-27 20:43:21.525', '2025-11-21 14:20:00.495', NULL, '2025-11-28'),
('20ee0910-36b3-48d6-ad96-2112d02fd9b6', 'Dilip Choudhary', 'dillip@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/1a814f4f-cdf4-43a8-980e-f1062695f730.png', 'https://github.com/dilip7654', 'https://www.linkedin.com/in/dilip-choudhary-39966421a/', NULL, NULL, NULL, NULL, NULL, '2026-01-01 00:00:00', 'true', 'false', '2025-07-27 19:47:54.658', '2025-07-27 20:00:57.185', NULL, NULL),
('1ff4b36d-5671-4855-8476-d0a8993f9873', ' Aditya Modak', 'aditya@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/01800613-ca50-43ae-b0a4-a076c9da427d.jpeg', 'https://github.com/Aditya2002M', 'https://www.linkedin.com/in/aditya-modak-42a684250/', NULL, NULL, NULL, NULL, NULL, '2025-01-01 00:00:00', 'true', 'false', '2025-07-27 13:21:05.022', '2025-07-27 13:21:05.022', NULL, NULL),
('207bb8bd-3e48-40c8-83ce-a825cb9fe474', 'syswraith', 'syswraith@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'false', 'false', '2025-10-27 14:57:13.93', '2025-10-27 14:57:13.93', NULL, NULL),
('c5b2470d-7fb4-4c93-bfe2-fedc00415dc2', 'Shashwati Meshram ', 'shashwati@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/WhatsApp%20Image%202025-07-28%20at%205.00.43%20PM.jpeg', 'https://github.com/Shashwati12', 'https://www.linkedin.com/in/shashwati-meshram-785316325/', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'false', '2025-07-27 13:57:14.412', '2025-07-27 13:57:14.412', NULL, NULL),
('75ef229a-3770-46aa-adc8-f4d250c6ac81', 'Shivam Korade', 'shivam@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/be5d5c49-da35-4979-8e06-0b8bc56edea6.jpeg', NULL, 'https://www.linkedin.com/in/shivam-korade/', NULL, NULL, NULL, NULL, NULL, '2025-01-01 00:00:00', 'true', 'false', '2025-07-27 17:32:15.43', '2025-07-27 17:32:15.43', NULL, NULL),
('516af252-e8dc-48a4-80c4-5af1e0758e58', 'Sahil Lakare', 'sahillakare@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/ec07d6cd-d1b5-43b1-8749-11baca35abba.jpeg', NULL, 'https://www.linkedin.com/in/sahil-lakare-842304298/', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'false', 'false', '2025-07-27 14:07:22.15', '2025-10-06 06:38:03.943', '77165f92-1a09-407c-987f-0fc9be16fad8', NULL),
('046d352f-10d9-49b5-bbed-31d67bf4b583', 'Shreyash Kapse', 'sheryash@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/6360ee38-249d-4d40-83c2-de1bd2b03d22.png', NULL, NULL, NULL, NULL, 'https://leetcode.com', 'https://codechef.com', NULL, '2026-01-01 00:00:00', 'false', 'false', '2025-07-27 18:28:44.084', '2025-10-06 06:38:11.206', '77165f92-1a09-407c-987f-0fc9be16fad8', NULL),
('e68ca856-978b-4bb5-a2f1-6497278624bb', 'Abhiram Suradkar', 'Abhiram@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/6cec207d-5cac-466a-96cf-00faaae9141f.jpeg', 'https://github.com/abhi32GBram', 'https://www.linkedin.com/in/abhiram-suradkar-a6728622b/', NULL, NULL, NULL, NULL, NULL, '2025-01-01 00:00:00', 'true', 'false', '2025-07-27 18:41:32.116', '2025-07-27 18:41:32.116', NULL, NULL),
('ef59db8b-2ad5-4e0a-b741-f58521bf61ec', 'Komal Warake', 'komal@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/8aa5e9df-6bf1-458f-b65f-03d1a3389398.png', 'https://github.com/komalwarke1', 'https://www.linkedin.com/in/komal-warake01', NULL, NULL, NULL, NULL, NULL, '2026-01-01 00:00:00', 'true', 'false', '2025-07-27 19:29:28.585', '2025-07-27 19:32:17.955', NULL, NULL),
('bf152df5-3c23-4c1c-85aa-212e0487b420', 'Prathamesh Shinde', 'prathamesh@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/a0915ccc-c8f3-498a-96b1-1731e0f01258.jpeg', 'https://github.com/prathameshshinde555', 'https://www.linkedin.com/in/prathameshshinde555/', NULL, NULL, NULL, NULL, NULL, '2024-01-01 00:00:00', 'true', 'false', '2025-07-27 13:04:35.098', '2025-07-27 13:04:35.098', NULL, NULL),
('0b83d3e3-8685-4cfe-9f63-6cc22c1ceae4', 'Prajkta Patil', 'prajakta@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/ac073ec8-59b2-4f71-8fb0-1be1af7044b5.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-01 00:00:00', 'false', 'false', '2025-07-27 18:32:26.724', '2025-07-31 18:13:22.227', '77165f92-1a09-407c-987f-0fc9be16fad8', NULL),
('64464cc4-4dfc-4522-a256-6aca2371df7f', 'Veda Bhadane', 'veda@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/0b34ae85-da4a-480f-adc5-f27e83e47c32.jpeg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-01 00:00:00', 'false', 'false', '2025-07-27 18:06:52.395', '2025-10-27 06:54:48.588', '77165f92-1a09-407c-987f-0fc9be16fad8', NULL),
('ad525dce-67dd-4878-ab95-068943923b81', 'Sarvesh Shahane', 'sarvesh@gmail.com', '9421957635', 'I am that guy.', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/2e341e00-8b4b-4276-b7c6-e0a68c45f73c.jpeg', 'https://github.com/i-am-that-guy', 'https://www.linkedin.com/in/sarveshshahane', 'https://x.com/_That_Guy_Here_', 'https://www.geeksforgeeks.org/profile/sarveshshaqram/', 'https://leetcode.com/u/This-Is-My-GitHub-Account/', 'https://www.codechef.com/users/i_am_that_guy', 'https://codeforces.com/profile/i_am_that_guy', '2025-01-01 00:00:00', 'true', 'false', '2025-07-27 13:29:37.542', '2025-07-27 21:14:03.77', NULL, '2026-01-07'),
('c494d747-5123-457f-b9cf-f3359f5a0fe8', 'Shruti Jadhav ', 'shruti@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/b01eec07-de6c-49eb-b4cd-31dbb17d1d71.jpeg', 'https://github.com/shrutiiiyet', 'https://www.linkedin.com/in/shruti-jadhav-892164277/', NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'true', 'true', '2025-07-27 17:18:50.419', '2025-07-27 19:59:53.048', NULL, NULL),
('cffc47fb-1147-4dd5-9818-21d209dbe3f3', 'Harsh Bhavsar', 'harsh@gmail.com', NULL, NULL, 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/members/66a493c8-5de1-4be8-b64a-d2639ec000e3.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2027-01-01 00:00:00', 'false', 'false', '2025-07-27 18:37:15.882', '2025-09-15 14:45:06.273', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', NULL);


--
-- Data for Name: MemberAchievement; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MemberAchievement" ("memberId", "achievementId") VALUES
('22ba7f7a-14e7-45fa-bf5f-51d5f015496f', '3'),
('644b5e8f-910d-450e-a855-a88f31d02b7b', '4'),
('6c968bfa-ebf8-4b2b-a349-36bbc9cc2870', '4'),
('1ff4b36d-5671-4855-8476-d0a8993f9873', '4'),
('046d352f-10d9-49b5-bbed-31d67bf4b583', '4'),
('bf152df5-3c23-4c1c-85aa-212e0487b420', '5'),
('75ef229a-3770-46aa-adc8-f4d250c6ac81', '5'),
('48724979-f9c8-46de-b9ab-9ca0186596d0', '5'),
('86237b63-1339-49d6-ad57-1d4b93bd5092', '5'),
('1b5933a9-5d50-4246-861a-ca0d30bd581f', '6'),
('c494d747-5123-457f-b9cf-f3359f5a0fe8', '6'),
('db2bd9ec-25e5-4134-ae53-fea1734ca161', '6'),
('d46a667d-5b68-4b82-9de7-fcfdf0ab0181', '6'),
('69394246-3e41-4eb5-812a-48801b0b5f3e', '7'),
('7dd07cc1-08da-48cc-a162-f546356fe291', '7'),
('b6f44922-fff3-48eb-a0c9-15d41e786e38', '7'),
('259a1e70-c093-43d4-8aa1-bba058a896b8', '7'),
('644b5e8f-910d-450e-a855-a88f31d02b7b', '8'),
('86237b63-1339-49d6-ad57-1d4b93bd5092', '8'),
('ad525dce-67dd-4878-ab95-068943923b81', '8'),
('69394246-3e41-4eb5-812a-48801b0b5f3e', '9'),
('d7d54e46-8db2-449c-87f9-8e89e8537c42', '9'),
('46cfa3aa-1efe-4cc6-a624-340808ef7cb8', '9'),
('b6f44922-fff3-48eb-a0c9-15d41e786e38', '9'),
('bf152df5-3c23-4c1c-85aa-212e0487b420', '10'),
('0cc29a18-180c-408d-9cbe-0fc06109a5c1', '10'),
('03a1a0f8-c1b9-4ac1-99d9-f10f26a82f7c', '11'),
('64464cc4-4dfc-4522-a256-6aca2371df7f', '11'),
('046d352f-10d9-49b5-bbed-31d67bf4b583', '11'),
('69394246-3e41-4eb5-812a-48801b0b5f3e', '12'),
('c5b2470d-7fb4-4c93-bfe2-fedc00415dc2', '12'),
('0b83d3e3-8685-4cfe-9f63-6cc22c1ceae4', '13'),
('1b5933a9-5d50-4246-861a-ca0d30bd581f', '13'),
('22ba7f7a-14e7-45fa-bf5f-51d5f015496f', '13'),
('329d6d7a-9787-452e-9c0c-506481c5462a', '13'),
('64464cc4-4dfc-4522-a256-6aca2371df7f', '13'),
('cffc47fb-1147-4dd5-9818-21d209dbe3f3', '13'),
('69394246-3e41-4eb5-812a-48801b0b5f3e', '14'),
('ad525dce-67dd-4878-ab95-068943923b81', '15'),
('20ee0910-36b3-48d6-ad96-2112d02fd9b6', '15'),
('738b73b4-0725-4f7c-95bf-cbdb72eb4e84', '15'),
('f032f524-c153-496f-9eea-e2ff8622f3d1', '15');


--
-- Data for Name: MemberProject; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MemberProject" ("memberId", "projectId") VALUES
('22ba7f7a-14e7-45fa-bf5f-51d5f015496f', '3'),
('22ba7f7a-14e7-45fa-bf5f-51d5f015496f', '4'),
('ad525dce-67dd-4878-ab95-068943923b81', '4'),
('1404e81c-d567-4103-941b-0abeea7fc049', '4'),
('1b5933a9-5d50-4246-861a-ca0d30bd581f', '6'),
('c494d747-5123-457f-b9cf-f3359f5a0fe8', '6'),
('db2bd9ec-25e5-4134-ae53-fea1734ca161', '6'),
('d46a667d-5b68-4b82-9de7-fcfdf0ab0181', '6'),
('d7d54e46-8db2-449c-87f9-8e89e8537c42', '8'),
('c5b2470d-7fb4-4c93-bfe2-fedc00415dc2', '8'),
('1b482f80-f649-45f9-a90b-7538a7a6e66e', '8'),
('329d6d7a-9787-452e-9c0c-506481c5462a', '8'),
('69394246-3e41-4eb5-812a-48801b0b5f3e', '10'),
('d7d54e46-8db2-449c-87f9-8e89e8537c42', '10'),
('46cfa3aa-1efe-4cc6-a624-340808ef7cb8', '10'),
('b6f44922-fff3-48eb-a0c9-15d41e786e38', '10'),
('ad525dce-67dd-4878-ab95-068943923b81', '11'),
('8eeacf82-18e5-48f8-a11e-fdbbe2eb81ce', '11'),
('1ff4b36d-5671-4855-8476-d0a8993f9873', '11'),
('22ba7f7a-14e7-45fa-bf5f-51d5f015496f', '11'),
('77165f92-1a09-407c-987f-0fc9be16fad8', '11'),
('d7d54e46-8db2-449c-87f9-8e89e8537c42', '11'),
('c5b2470d-7fb4-4c93-bfe2-fedc00415dc2', '11'),
('1b5933a9-5d50-4246-861a-ca0d30bd581f', '11'),
('c494d747-5123-457f-b9cf-f3359f5a0fe8', '11'),
('69394246-3e41-4eb5-812a-48801b0b5f3e', '13'),
('c5b2470d-7fb4-4c93-bfe2-fedc00415dc2', '13'),
('ad525dce-67dd-4878-ab95-068943923b81', '14'),
('77165f92-1a09-407c-987f-0fc9be16fad8', '14'),
('bf152df5-3c23-4c1c-85aa-212e0487b420', '15'),
('69394246-3e41-4eb5-812a-48801b0b5f3e', '16'),
('c5b2470d-7fb4-4c93-bfe2-fedc00415dc2', '16'),
('22ba7f7a-14e7-45fa-bf5f-51d5f015496f', '16'),
('db2bd9ec-25e5-4134-ae53-fea1734ca161', '16');


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Project" (id, name, "imageUrl", "githubUrl", "deployUrl", "createdAt", "createdById", "updatedAt", "updatedById") VALUES
('3', 'Codenest', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/projects/ea048f75-12ca-426f-a0f7-da5bd8d2a6ab.jpeg', 'https://github.com/VanshKing30/codenest', NULL, '2025-07-27 20:24:12.073', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', '2025-07-27 20:24:12.073', NULL),
('4', 'FoodiesWeb', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/projects/5b2ea1df-4bbb-40f5-896a-add8dd6573c7.png', 'https://github.com/VanshKing30/FoodiesWeb', 'https://foodies-web-app.vercel.app/', '2025-07-27 20:25:05.349', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', '2025-07-27 20:25:05.349', NULL),
('6', 'Sportify', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/projects/2cfe891d-f838-4118-9a89-bae85a5adab6.png', 'https://github.com/call-0f-code/Sportify', NULL, '2025-07-27 20:40:13.289', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', '2025-07-27 20:40:13.289', NULL),
('8', 'EventHub', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/projects/259f8cf5-d265-4948-bbc7-987710af6b7e.jpeg', 'https://github.com/Shashwati12/Event-Hub', NULL, '2025-07-27 20:51:06.857', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', '2025-07-27 20:51:06.857', NULL),
('10', 'Wanderlust', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/projects/0da621d2-a076-4043-ac6a-04d2aabbcebf.jpeg', 'https://github.com/Sherin-2711/Wanderlust', NULL, '2025-07-27 20:58:40.253', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', '2025-07-27 20:58:40.253', NULL),
('11', 'CallOfCode', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/projects/fb99db7f-4262-4093-af16-c45fdadea1e8.png', 'https://github.com/call-0f-code/call-of-code', 'https://callofcode.in/', '2025-07-27 21:07:20.413', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', '2025-07-27 21:07:20.413', NULL),
('13', 'WellnessWave', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/projects/54f25849-1484-4746-aa77-aa623b52bf54.png', 'https://github.com/SHUBHAMTOHAKE0203/WellnessWave-Hospital-Hunar-Intern-Hackathon', 'https://shubhamtohake0203.github.io/WellnessWave-Hospital-Hunar-Intern-Hackathon/', '2025-07-27 21:10:42.857', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', '2025-07-27 21:10:42.857', NULL),
('14', 'EventHub', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/projects/79e2f1c2-4fa6-4267-9847-b8b6ae516a76.png', 'https://github.com/i-am-that-guy/EventHub', 'https://eventhub-1ukr.onrender.com/', '2025-07-27 21:28:03.777', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', '2025-07-27 21:28:03.777', NULL),
('15', 'Technothon', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/projects/a4fae4ae-3829-47c6-a088-b5e3f2d1d51a.png', 'https://github.com/call-0f-code/technothon', 'https://call-0f-code.github.io/technothon/', '2025-07-27 21:29:52.401', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', '2025-07-27 21:29:52.401', NULL),
('16', 'CureWave', 'https://riqqtbuoaycwwiemnmri.supabase.co/storage/v1/object/public/images/projects/bedabfee-a51e-49e4-86e7-f9d263002f1f.png', 'https://github.com/SHUBHAMTOHAKE0203/CureWave', 'https://cure-wave-one.vercel.app/', '2025-07-27 21:33:33.669', 'c494d747-5123-457f-b9cf-f3359f5a0fe8', '2025-07-27 21:33:33.669', NULL);


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Question" (id, "questionName", difficulty, link, "topicId", "createdById", "createdAt", "updatedAt", "updatedById") VALUES
('19', 'Remove element', 'Medium', 'https://leetcode.com/problems/remove-element/description/?envType=study-plan-v2&envId=top-interview-150', '22', '77165f92-1a09-407c-987f-0fc9be16fad8', '2025-10-14 19:05:11.882', '2025-10-15 03:49:46.988', '77165f92-1a09-407c-987f-0fc9be16fad8');


--
-- Data for Name: Topic; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Topic" (id, title, description, "createdById", "createdAt", "updatedAt", "updatedById") VALUES
('23', 'TOPIC NAME ', 'JSBDNREMC DKVNROEJFPWMC REGFIRHGR VSM CLSMJFORJO HA HEE ITJAOJJA', '77165f92-1a09-407c-987f-0fc9be16fad8', '2025-10-14 18:47:47.527', '2025-10-14 18:47:47.527', '77165f92-1a09-407c-987f-0fc9be16fad8'),
('22', 'demoooooo', 'who the fuck writes demo like this ', '77165f92-1a09-407c-987f-0fc9be16fad8', '2025-10-14 18:31:21.048', '2025-10-15 03:43:53.083', '77165f92-1a09-407c-987f-0fc9be16fad8');


-- Supabase compatibility fixes (appended for local setup)
-- Ensure enum types used by Prisma exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Difficulty') THEN
        CREATE TYPE public."Difficulty" AS ENUM ('Easy','Medium','Hard');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Verdict') THEN
        CREATE TYPE public."Verdict" AS ENUM ('Selected','Rejected','Pending');
    END IF;
END$$;

-- Create auth schema and minimal users table if missing
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY,
    aud text,
    role text,
    email text,
    encrypted_password text,
    email_confirmed boolean DEFAULT false,
    raw_user_meta_data jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert a sample auth user mapped to an existing Member (no-op if already exists)
INSERT INTO auth.users (id, aud, role, email, email_confirmed)
VALUES ('77165f92-1a09-407c-987f-0fc9be16fad8','authenticated','authenticated','harish@gmail.com', true)
ON CONFLICT (id) DO NOTHING;

-- Create simple DB roles for local testing and grant access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
    END IF;
END$$;

-- Grant read access to anon and full access to service_role for local development only
GRANT USAGE ON SCHEMA public TO anon, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Ensure future tables inherit privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- End of appended Supabase compatibility SQL


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES
('2b698eba-1b33-44fd-b82a-c5c6043ef533', '89625be867ca784d446e9010c858e973cdac24ce7375c77db48bf56c294ec822', '2025-07-27 11:16:59.055498+00', '20250713111533_first_prisma_migration', NULL, NULL, '2025-07-27 11:16:58.7832+00', '1'),
('62ee3fac-53d8-4a55-84a1-3b92da855594', 'a13448142741adec639e1f8a1c28c39c767427e580ead7fac23fe3a6a3f394ae', '2025-07-27 11:16:59.4006+00', '20250718201903_init', NULL, NULL, '2025-07-27 11:16:59.145301+00', '1'),
('f8043ab8-18cb-4d4e-a20c-acb3ef6cdf68', '14515e15ca68369491dabe78a7f059e4d5157e51eab6a28d38483afe49afcb39', '2025-07-27 11:16:59.703971+00', '20250719123800_image_url_githuburk_make_complusory', NULL, NULL, '2025-07-27 11:16:59.501527+00', '1'),
('f0a81f30-46ba-4561-a537-60ce243a191e', 'e312f3719ce8eb87764107f8467b419001c25510c4302f444e7743fa20b0c30d', '2025-07-27 11:18:21.610297+00', '20250727111821_passoutyear_optional', NULL, NULL, '2025-07-27 11:18:21.388193+00', '1'),
('6446026f-c163-4250-a5f1-e1e89e8269a0', '247a03b37d029c1af7ade67e7c91eced3e5adeec02cd9b8c7e67e08e148cbfd6', '2025-10-16 19:11:32.783002+00', '20251016191132_birth_date_added_to_member', NULL, NULL, '2025-10-16 19:11:32.620529+00', '1'),
('e87cdcbd-1fbb-4285-8738-e7072925decb', 'f8c188dd8523234c3b95f96c4a8a78a585828817f07fdbf1c294502072ace662', '2025-10-16 19:38:12.06791+00', '20251016193811_birth_date_type_fix', NULL, NULL, '2025-10-16 19:38:11.846426+00', '1');


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES
('20211116024918', '2025-07-13 10:28:51'),
('20211116045059', '2025-07-13 10:28:52'),
('20211116050929', '2025-07-13 10:28:53'),
('20211116051442', '2025-07-13 10:28:53'),
('20211116212300', '2025-07-13 10:28:54'),
('20211116213355', '2025-07-13 10:28:55'),
('20211116213934', '2025-07-13 10:28:55'),
('20211116214523', '2025-07-13 10:28:56'),
('20211122062447', '2025-07-13 10:28:57'),
('20211124070109', '2025-07-13 10:28:57'),
('20211202204204', '2025-07-13 10:28:58'),
('20211202204605', '2025-07-13 10:28:59'),
('20211210212804', '2025-07-13 10:29:01'),
('20211228014915', '2025-07-13 10:29:01'),
('20220107221237', '2025-07-13 10:29:02'),
('20220228202821', '2025-07-13 10:29:02'),
('20220312004840', '2025-07-13 10:29:03'),
('20220603231003', '2025-07-13 10:29:04'),
('20220603232444', '2025-07-13 10:29:05'),
('20220615214548', '2025-07-13 10:29:05'),
('20220712093339', '2025-07-13 10:29:06'),
('20220908172859', '2025-07-13 10:29:07'),
('20220916233421', '2025-07-13 10:29:07'),
('20230119133233', '2025-07-13 10:29:08'),
('20230128025114', '2025-07-13 10:29:09'),
('20230128025212', '2025-07-13 10:29:09'),
('20230227211149', '2025-07-13 10:29:10'),
('20230228184745', '2025-07-13 10:29:11'),
('20230308225145', '2025-07-13 10:29:11'),
('20230328144023', '2025-07-13 10:29:12'),
('20231018144023', '2025-07-13 10:29:12'),
('20231204144023', '2025-07-13 10:29:13'),
('20231204144024', '2025-07-13 10:29:14'),
('20231204144025', '2025-07-13 10:29:15'),
('20240108234812', '2025-07-13 10:29:15'),
('20240109165339', '2025-07-13 10:29:16'),
('20240227174441', '2025-07-13 10:29:17'),
('20240311171622', '2025-07-13 10:29:18'),
('20240321100241', '2025-07-13 10:29:19'),
('20240401105812', '2025-07-13 10:29:21'),
('20240418121054', '2025-07-13 10:29:22'),
('20240523004032', '2025-07-13 10:29:24'),
('20240618124746', '2025-07-13 10:29:25'),
('20240801235015', '2025-07-13 10:29:25'),
('20240805133720', '2025-07-13 10:29:26'),
('20240827160934', '2025-07-13 10:29:26'),
('20240919163303', '2025-07-13 10:29:27'),
('20240919163305', '2025-07-13 10:29:28'),
('20241019105805', '2025-07-13 10:29:29'),
('20241030150047', '2025-07-13 10:29:31'),
('20241108114728', '2025-07-13 10:29:32'),
('20241121104152', '2025-07-13 10:29:32'),
('20241130184212', '2025-07-13 10:29:33'),
('20241220035512', '2025-07-13 10:29:34'),
('20241220123912', '2025-07-13 10:29:34'),
('20241224161212', '2025-07-13 10:29:35'),
('20250107150512', '2025-07-13 10:29:35'),
('20250110162412', '2025-07-13 10:29:36'),
('20250123174212', '2025-07-13 10:29:37'),
('20250128220012', '2025-07-13 10:29:37'),
('20250506224012', '2025-07-13 10:29:38'),
('20250523164012', '2025-07-13 10:29:38'),
('20250714121412', '2025-07-18 09:59:25'),
('20250905041441', '2025-10-03 22:35:03'),
('20251103001201', '2025-11-13 08:50:05'),
('20251120212548', '2026-03-23 05:56:26'),
('20251120215549', '2026-03-23 05:56:26'),
('20260218120000', '2026-03-23 05:56:27');

--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Achievement Achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY (id);


--
-- Name: CompletedQuestion CompletedQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CompletedQuestion"
    ADD CONSTRAINT "CompletedQuestion_pkey" PRIMARY KEY ("memberId", "questionId");


--
-- Name: InterviewExperience InterviewExperience_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InterviewExperience"
    ADD CONSTRAINT "InterviewExperience_pkey" PRIMARY KEY (id);


--
-- Name: MemberAchievement MemberAchievement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberAchievement"
    ADD CONSTRAINT "MemberAchievement_pkey" PRIMARY KEY ("memberId", "achievementId");


--
-- Name: MemberProject MemberProject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberProject"
    ADD CONSTRAINT "MemberProject_pkey" PRIMARY KEY ("memberId", "projectId");


--
-- Name: Member Member_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Member"
    ADD CONSTRAINT "Member_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: Topic Topic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Topic"
    ADD CONSTRAINT "Topic_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);

--
-- Name: Account Account_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Achievement Achievement_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Achievement Achievement_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CompletedQuestion CompletedQuestion_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CompletedQuestion"
    ADD CONSTRAINT "CompletedQuestion_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompletedQuestion CompletedQuestion_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CompletedQuestion"
    ADD CONSTRAINT "CompletedQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InterviewExperience InterviewExperience_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InterviewExperience"
    ADD CONSTRAINT "InterviewExperience_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberAchievement MemberAchievement_achievementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberAchievement"
    ADD CONSTRAINT "MemberAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES public."Achievement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberAchievement MemberAchievement_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberAchievement"
    ADD CONSTRAINT "MemberAchievement_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberProject MemberProject_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberProject"
    ADD CONSTRAINT "MemberProject_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberProject MemberProject_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MemberProject"
    ADD CONSTRAINT "MemberProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Member Member_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Member"
    ADD CONSTRAINT "Member_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Project Project_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Project Project_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Question Question_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Question Question_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."Topic"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Question Question_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Topic Topic_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Topic"
    ADD CONSTRAINT "Topic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Topic Topic_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Topic"
    ADD CONSTRAINT "Topic_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE SET NULL;


COMMIT;
