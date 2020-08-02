PGDMP     
    $                x           postgres    12.3    12.3                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    13318    postgres    DATABASE     �   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'Hebrew_Israel.1255' LC_CTYPE = 'Hebrew_Israel.1255';
    DROP DATABASE postgres;
                postgres    false                       0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                   postgres    false    2840                        3079    16384 	   adminpack 	   EXTENSION     A   CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;
    DROP EXTENSION adminpack;
                   false                       0    0    EXTENSION adminpack    COMMENT     M   COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';
                        false    1            �            1259    16424 	   PromoCode    TABLE     �   CREATE TABLE public."PromoCode" (
    "ID" smallint NOT NULL,
    "PromoCode" text NOT NULL,
    "Description" text NOT NULL
);
    DROP TABLE public."PromoCode";
       public         heap    postgres    false            �            1259    16410    Transactions    TABLE     �  CREATE TABLE public."Transactions" (
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
 "   DROP TABLE public."Transactions";
       public         heap    postgres    false            �            1259    16402    Users    TABLE     g  CREATE TABLE public."Users" (
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
    DROP TABLE public."Users";
       public         heap    postgres    false            �            1259    16420    Users_ID_seq    SEQUENCE     �   ALTER TABLE public."Users" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Users_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    203                      0    16424 	   PromoCode 
   TABLE DATA           G   COPY public."PromoCode" ("ID", "PromoCode", "Description") FROM stdin;
    public          postgres    false    206   j                 0    16410    Transactions 
   TABLE DATA           �   COPY public."Transactions" ("ID", "Product", "Model", "Date", "User", "Price", "LocalPrice", "TotalPriceIncludingVAT", "Number", "Name", "ExpDate", "CVV", "Memo") FROM stdin;
    public          postgres    false    204   �                 0    16402    Users 
   TABLE DATA           �   COPY public."Users" ("ID", "Name", "FamilyName", "Email", "PromoCode", "PhoneNumber", "Country", "City", "Street", "ZipCode", "Password", "Spare1", "Spare2", "Spare3", "Spare4") FROM stdin;
    public          postgres    false    203   �                  0    0    Users_ID_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public."Users_ID_seq"', 16, true);
          public          postgres    false    205            �
           2606    16431    PromoCode PromoCode_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public."PromoCode"
    ADD CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("ID");
 F   ALTER TABLE ONLY public."PromoCode" DROP CONSTRAINT "PromoCode_pkey";
       public            postgres    false    206            �
           2606    16417    Transactions Transactions_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_pkey" PRIMARY KEY ("ID");
 L   ALTER TABLE ONLY public."Transactions" DROP CONSTRAINT "Transactions_pkey";
       public            postgres    false    204            �
           2606    16409    Users Users_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("ID");
 >   ALTER TABLE ONLY public."Users" DROP CONSTRAINT "Users_pkey";
       public            postgres    false    203               H   x�3�4�p*�44PUH�,N�/�+�2�4qqs���THI-N��2�4s		䥖��2J2����b���� �Q�            x������ � �         u   x�34�t,�NL����/J-)ή�L�--��s3s���s99c�P��Q����JA��A�[�gDeRNqz���I���EI�WnAh^�cn�cpQjn��c��I�Yf�I�0$��b���� �i(      