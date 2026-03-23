insert into public.categories (slug, icon, name_ar, name_fr, description_ar, description_fr, sort_order)
values
  ('plumber', '🔧', 'سبّاك', 'Plombier', 'تسربات المياه والحمّامات والمطابخ.', 'Fuites, salles de bain et cuisines.', 1),
  ('electrician', '⚡', 'كهربائي', 'Électricien', 'أعطال الكهرباء والمقابس والقواطع.', 'Pannes, prises et tableaux électriques.', 2),
  ('water-heater', '🔥', 'تقني سخان الماء', 'Chauffe-eau', 'إصلاح وتركيب سخانات الماء.', 'Installation et réparation de chauffe-eau.', 3),
  ('ac-repair', '❄️', 'تصليح المكيّف', 'Climatisation', 'صيانة وتنظيف وإصلاح المكيّفات.', 'Entretien et réparation de climatiseurs.', 4),
  ('city-gas', '🛠️', 'تقني غاز المدينة', 'Technicien gaz', 'فحص التسربات والتركيب والصيانة.', 'Contrôle et maintenance gaz.', 5),
  ('painter', '🎨', 'دهّان', 'Peintre', 'دهان داخلي وخارجي وتشطيبات.', 'Peinture intérieure et finitions.', 6),
  ('mason', '🧱', 'بنّاء', 'Maçon', 'أشغال بناء خفيفة وإصلاحات.', 'Petits travaux de maçonnerie.', 7),
  ('carpenter', '🪚', 'نجّار', 'Menuisier', 'أبواب وخزائن وتصليحات خشبية.', 'Portes, placards et réparations bois.', 8),
  ('handyman', '🧰', 'تصليحات عامة', 'Homme à tout faire', 'أعمال تركيب وصيانة متعددة.', 'Interventions polyvalentes.', 9),
  ('mechanic', '🚗', 'ميكانيكي', 'Mécanicien', 'تشخيص وصيانة ميكانيكية خفيفة.', 'Diagnostic et mécanique légère.', 10)
on conflict (slug) do nothing;

insert into public.zones (slug, wilaya, name_ar, name_fr, sort_order)
values
  ('oran-centre', 'Oran', 'وهران الوسط', 'Oran Centre', 1),
  ('bir-el-djir', 'Oran', 'بئر الجير', 'Bir El Djir', 2),
  ('es-senia', 'Oran', 'السانيا', 'Es Senia', 3),
  ('ain-turk', 'Oran', 'عين الترك', 'Ain Turk', 4),
  ('algiers-centre', 'Algiers', 'الجزائر الوسط', 'Alger Centre', 5),
  ('bab-ezzouar', 'Algiers', 'باب الزوار', 'Bab Ezzouar', 6),
  ('hydra', 'Algiers', 'حيدرة', 'Hydra', 7),
  ('bir-mourad-rais', 'Algiers', 'بئر مراد رايس', 'Bir Mourad Rais', 8),
  ('cheraga', 'Algiers', 'الشراقة', 'Cheraga', 9),
  ('rouiba', 'Algiers', 'رويبة', 'Rouiba', 10)
on conflict (slug) do nothing;

insert into public.users (id, full_name, phone_number, role)
values
  ('91111111-1111-4111-8111-111111111111', 'أمين بوجمعة', '+213699001122', 'customer'),
  ('92222222-2222-4222-8222-222222222222', 'Nora Saadi', '+213770102030', 'customer'),
  ('93333333-3333-4333-8333-333333333333', 'ريم', '+213556901177', 'customer')
on conflict (phone_number) do nothing;

insert into public.providers (
  id, slug, display_name, workshop_name, phone_number, whatsapp_number, hourly_rate, travel_fee, years_experience,
  bio_ar, bio_fr, tagline_ar, tagline_fr, google_maps_url, response_time_minutes, completed_jobs_count,
  rating_average, review_count, approval_status, is_verified, featured, profile_photo_url
)
values
  ('11111111-1111-4111-8111-111111111111', 'karim-benali', 'كريم بن علي', 'Benali Plomberie', '+213555123456', '213555123456', 2500, 1000, 11, 'متخصص في التسربات، انسداد القنوات، وصيانة مطابخ وحمامات المنازل مع حضور سريع داخل وهران.', 'Spécialiste des fuites et des réparations domestiques rapides dans Oran.', 'خدمة سريعة للحمّامات والمطابخ', 'Interventions rapides cuisine et salle de bain', 'https://maps.google.com/?q=Oran%20Centre%20Algeria', 14, 132, 4.90, 18, 'approved', true, true, '/placeholders/provider-avatar.svg'),
  ('22222222-2222-4222-8222-222222222222', 'sofiane-mekki', 'سفيان مكي', 'Atelier Mekki Electric', '+213666221100', '213666221100', 3200, 1200, 14, 'أعطال الكهرباء المنزلية، تبديل القواطع، وتركيب الإنارة مع تشخيص سريع وواضح.', 'Pannes électriques, tableaux, prises et luminaires avec diagnostic rapide.', 'كهربائي منزلي موثوق في بئر الجير', 'Électricien fiable à Bir El Djir', 'https://maps.google.com/?q=Bir%20El%20Djir%20Oran', 18, 214, 4.80, 23, 'approved', true, true, '/placeholders/provider-avatar.svg'),
  ('33333333-3333-4333-8333-333333333333', 'nadia-klim', 'نادية كليم', 'Clima Nadia', '+213777889012', '213777889012', 3500, 1200, 9, 'صيانة المكيّفات، تعبئة الغاز، التنظيف الموسمي، وإصلاح الأعطال الأكثر شيوعاً.', 'Réparation, recharge, nettoyage et entretien des climatiseurs à Oran.', 'تنظيف وصيانة مكيّفات المنازل', 'Entretien et réparation de climatiseurs', 'https://maps.google.com/?q=Es%20Senia%20Oran', 31, 91, 4.70, 15, 'approved', true, true, '/placeholders/provider-avatar.svg'),
  ('44444444-4444-4444-8444-444444444444', 'gaz-salam', 'غاز السلام', 'Gaz Salam', '+213698776655', '213698776655', 3400, 1500, 12, 'فحص التسربات، تبديل قطع الغاز المنزلية، وصيانة الشبكات الصغيرة مع احترام معايير السلامة.', 'Contrôle des fuites et maintenance d''installations gaz avec approche sécurisée.', 'خدمات غاز منزلية مع توثيق واضح', 'Interventions gaz domestique', 'https://maps.google.com/?q=Ain%20Turk%20Oran', 42, 67, 4.60, 11, 'approved', true, false, '/placeholders/provider-avatar.svg'),
  ('55555555-5555-4555-8555-555555555555', 'yacine-peinture', 'ياسين للطلاء', 'Yacine Peinture', '+213550984412', '213550984412', 2200, 1000, 8, 'دهان داخلي وخارجي، إصلاح تشققات خفيفة، وتحضير الجدران قبل الصبغ.', 'Peinture, préparation des murs et finitions intérieures ou extérieures.', 'تشطيبات هادئة ونظيفة للمنازل', 'Peinture propre et finitions soignées', 'https://maps.google.com/?q=Bir%20El%20Djir%20Oran', 56, 58, 4.50, 9, 'approved', false, false, '/placeholders/provider-avatar.svg'),
  ('66666666-6666-4666-8666-666666666666', 'reda-bois', 'رضا نجّار', 'Reda Bois', '+213661172210', '213661172210', 2900, 1200, 10, 'أبواب، خزائن، مطابخ، وتصليحات خشبية دقيقة داخل المنازل.', 'Portes, placards, cuisines et réparations bois sur mesure.', 'أشغال نجارة منزلية حسب المقاس', 'Menuiserie et ajustements sur mesure', 'https://maps.google.com/?q=Oran%20Centre%20Algeria', 49, 46, 4.40, 7, 'pending', false, false, '/placeholders/provider-avatar.svg'),
  ('77777777-7777-4777-8777-777777777777', 'fixpro-oran', 'FixPro Oran', 'FixPro Oran', '+213555661220', '213555661220', 2400, 900, 7, 'تصليحات منزلية خفيفة، تركيب تجهيزات، وفك وتركيب قطع بسيطة.', 'Petites réparations, installation d''équipements et maintenance générale.', 'حلول سريعة للتصليحات اليومية', 'Réparations domestiques du quotidien', 'https://maps.google.com/?q=Oran%20Centre%20Algeria', 24, 75, 4.60, 13, 'approved', true, true, '/placeholders/provider-avatar.svg')
on conflict (slug) do nothing;

insert into public.provider_services (provider_id, category_slug, is_primary)
values
  ('11111111-1111-4111-8111-111111111111', 'plumber', true),
  ('22222222-2222-4222-8222-222222222222', 'electrician', true),
  ('33333333-3333-4333-8333-333333333333', 'ac-repair', true),
  ('44444444-4444-4444-8444-444444444444', 'city-gas', true),
  ('55555555-5555-4555-8555-555555555555', 'painter', true),
  ('66666666-6666-4666-8666-666666666666', 'carpenter', true),
  ('77777777-7777-4777-8777-777777777777', 'handyman', true)
on conflict (provider_id, category_slug) do nothing;

insert into public.service_areas (provider_id, zone_slug)
values
  ('11111111-1111-4111-8111-111111111111', 'oran-centre'),
  ('11111111-1111-4111-8111-111111111111', 'bir-el-djir'),
  ('22222222-2222-4222-8222-222222222222', 'bir-el-djir'),
  ('22222222-2222-4222-8222-222222222222', 'oran-centre'),
  ('22222222-2222-4222-8222-222222222222', 'es-senia'),
  ('33333333-3333-4333-8333-333333333333', 'es-senia'),
  ('33333333-3333-4333-8333-333333333333', 'oran-centre'),
  ('44444444-4444-4444-8444-444444444444', 'ain-turk'),
  ('44444444-4444-4444-8444-444444444444', 'oran-centre'),
  ('55555555-5555-4555-8555-555555555555', 'bir-el-djir'),
  ('55555555-5555-4555-8555-555555555555', 'es-senia'),
  ('66666666-6666-4666-8666-666666666666', 'oran-centre'),
  ('77777777-7777-4777-8777-777777777777', 'oran-centre'),
  ('77777777-7777-4777-8777-777777777777', 'bir-el-djir')
on conflict (provider_id, zone_slug) do nothing;

insert into public.availability (provider_id, day_key, label_ar, label_fr, start_time, end_time)
values
  ('11111111-1111-4111-8111-111111111111', 'sat', 'السبت', 'Samedi', '08:00', '18:00'),
  ('11111111-1111-4111-8111-111111111111', 'sun', 'الأحد', 'Dimanche', '08:00', '18:00'),
  ('11111111-1111-4111-8111-111111111111', 'mon', 'الاثنين', 'Lundi', '08:00', '18:00'),
  ('22222222-2222-4222-8222-222222222222', 'sun', 'الأحد', 'Dimanche', '09:00', '18:30'),
  ('22222222-2222-4222-8222-222222222222', 'mon', 'الاثنين', 'Lundi', '09:00', '18:30'),
  ('22222222-2222-4222-8222-222222222222', 'tue', 'الثلاثاء', 'Mardi', '09:00', '18:30'),
  ('33333333-3333-4333-8333-333333333333', 'sat', 'السبت', 'Samedi', '09:30', '17:30'),
  ('33333333-3333-4333-8333-333333333333', 'mon', 'الاثنين', 'Lundi', '09:30', '17:30'),
  ('33333333-3333-4333-8333-333333333333', 'wed', 'الأربعاء', 'Mercredi', '09:30', '17:30'),
  ('44444444-4444-4444-8444-444444444444', 'sun', 'الأحد', 'Dimanche', '08:30', '16:30'),
  ('44444444-4444-4444-8444-444444444444', 'tue', 'الثلاثاء', 'Mardi', '08:30', '16:30'),
  ('44444444-4444-4444-8444-444444444444', 'thu', 'الخميس', 'Jeudi', '08:30', '16:30'),
  ('55555555-5555-4555-8555-555555555555', 'mon', 'الاثنين', 'Lundi', '08:00', '17:00'),
  ('55555555-5555-4555-8555-555555555555', 'wed', 'الأربعاء', 'Mercredi', '08:00', '17:00'),
  ('55555555-5555-4555-8555-555555555555', 'sat', 'السبت', 'Samedi', '08:00', '17:00'),
  ('66666666-6666-4666-8666-666666666666', 'sun', 'الأحد', 'Dimanche', '09:00', '17:00'),
  ('66666666-6666-4666-8666-666666666666', 'tue', 'الثلاثاء', 'Mardi', '09:00', '17:00'),
  ('66666666-6666-4666-8666-666666666666', 'thu', 'الخميس', 'Jeudi', '09:00', '17:00'),
  ('77777777-7777-4777-8777-777777777777', 'sat', 'السبت', 'Samedi', '08:30', '18:00'),
  ('77777777-7777-4777-8777-777777777777', 'sun', 'الأحد', 'Dimanche', '08:30', '18:00'),
  ('77777777-7777-4777-8777-777777777777', 'mon', 'الاثنين', 'Lundi', '08:30', '18:00');

insert into public.provider_photos (provider_id, url, alt_text, sort_order)
values
  ('11111111-1111-4111-8111-111111111111', '/gallery/work-1.svg', 'Kitchen pipe repair', 0),
  ('11111111-1111-4111-8111-111111111111', '/gallery/work-2.svg', 'Bathroom intervention', 1),
  ('11111111-1111-4111-8111-111111111111', '/gallery/work-3.svg', 'Leak inspection', 2),
  ('22222222-2222-4222-8222-222222222222', '/gallery/work-1.svg', 'Electrical panel', 0),
  ('22222222-2222-4222-8222-222222222222', '/gallery/work-2.svg', 'Lighting upgrade', 1),
  ('33333333-3333-4333-8333-333333333333', '/gallery/work-1.svg', 'AC cleaning', 0),
  ('33333333-3333-4333-8333-333333333333', '/gallery/work-3.svg', 'Cooling check', 1),
  ('44444444-4444-4444-8444-444444444444', '/gallery/work-2.svg', 'Gas inspection', 0),
  ('55555555-5555-4555-8555-555555555555', '/gallery/work-3.svg', 'Painting finish', 0),
  ('66666666-6666-4666-8666-666666666666', '/gallery/work-1.svg', 'Woodwork detail', 0),
  ('77777777-7777-4777-8777-777777777777', '/gallery/work-2.svg', 'General fixing', 0)
on conflict do nothing;

insert into public.bookings (
  id, provider_id, customer_name, phone_number, service_slug, booking_date, booking_time, zone_slug,
  address, google_maps_url, issue_description, preferred_contact_method, status, created_at
)
values
  ('81111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'أمين بوجمعة', '+213699001122', 'plumber', '2026-03-08', '10:30', 'oran-centre', 'حي الصديقية، وهران', 'https://maps.google.com/?q=Hai%20Es%20Sedikia%20Oran', 'تسرب تحت حوض المطبخ.', 'whatsapp', 'completed', '2026-03-07T17:15:00Z'),
  ('82222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Nora Saadi', '+213770102030', 'electrician', '2026-03-10', '16:00', 'bir-el-djir', 'USTO, Bir El Djir', 'https://maps.google.com/?q=USTO%20Bir%20El%20Djir', 'Disjoncteur qui saute chaque soir.', 'phone', 'confirmed', '2026-03-09T11:00:00Z'),
  ('83333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'ريم', '+213556901177', 'ac-repair', '2026-03-12', '12:00', 'es-senia', 'قرب مطار السانيا', 'https://maps.google.com/?q=Es%20Senia%20Airport', 'المكيّف لا يبرد بشكل كافٍ.', 'whatsapp', 'completed', '2026-03-11T18:20:00Z')
on conflict (id) do nothing;

insert into public.reviews (id, provider_id, booking_id, customer_name, rating, review_text, status, admin_note, created_at)
values
  ('a1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '81111111-1111-4111-8111-111111111111', 'أمين', 5, 'وصل في الوقت، شرح المشكلة، وأصلح التسرب بسرعة.', 'approved', null, '2026-03-08T09:30:00Z'),
  ('a2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', '82222222-2222-4222-8222-222222222222', 'Nora', 5, 'Très clair sur le devis et intervention propre.', 'approved', null, '2026-03-10T15:00:00Z'),
  ('a3333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', '83333333-3333-4333-8333-333333333333', 'ريم', 4, 'تنظيف ممتاز للمكيّف والشرح كان واضح.', 'approved', null, '2026-03-12T13:45:00Z')
on conflict (booking_id) do nothing;

insert into public.provider_verifications (provider_id, status, document_name, notes)
values
  ('11111111-1111-4111-8111-111111111111', 'verified', 'id-karim.pdf', 'Approved for launch in Oran.'),
  ('22222222-2222-4222-8222-222222222222', 'verified', 'id-sofiane.pdf', 'Approved for launch in Oran.'),
  ('33333333-3333-4333-8333-333333333333', 'verified', 'id-nadia.pdf', 'Approved for launch in Oran.'),
  ('44444444-4444-4444-8444-444444444444', 'verified', 'id-gaz-salam.pdf', 'Approved for launch in Oran.'),
  ('55555555-5555-4555-8555-555555555555', 'pending', null, 'Waiting for additional portfolio images.'),
  ('66666666-6666-4666-8666-666666666666', 'pending', null, 'Pending identity review.'),
  ('77777777-7777-4777-8777-777777777777', 'verified', 'id-fixpro.pdf', 'Approved for launch in Oran.')
on conflict (provider_id) do nothing;
