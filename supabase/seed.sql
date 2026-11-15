-- Krushi Mitra AI - Initial Seed Data
-- seed.sql

INSERT INTO public.crops (id, name_en, name_or, scientific_name, status) VALUES
('paddy', 'Paddy / Rice', 'ଧାନ (Paddy)', 'Oryza sativa L.', 'active'),
('maize', 'Maize', 'ମକା (Maize)', 'Zea mays L.', 'in_validation'),
('tomato', 'Tomato', 'ବିଲାତି ବାଇଗଣ (Tomato)', 'Solanum lycopersicum L.', 'in_validation'),
('brinjal', 'Brinjal', 'ବାଇଗଣ (Brinjal)', 'Solanum melongena L.', 'in_validation'),
('chilli', 'Chilli', 'ଲଙ୍କା (Chilli)', 'Capsicum annuum L.', 'in_validation'),
('groundnut', 'Groundnut', 'ଚିନାବାଦାମ (Groundnut)', 'Arachis hypogaea L.', 'in_validation'),
('pulses', 'Pulses (Green / Black Gram)', 'ମୁଗ / ବିରି (Pulses)', 'Vigna radiata L.', 'in_validation')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pest_species (id, crop_id, common_name_en, common_name_or, scientific_name, local_odisha_name, potential_damage, is_beneficial) VALUES
('bph', 'paddy', 'Brown Planthopper (BPH)', 'ମାଟିଆ ଗୁଣ୍ଡି ପୋକ', 'Nilaparvata lugens (Stål)', 'ମାଟିଆ ଗୁଣ୍ଡି ପୋକ', '40% - 100% (Hopperburn)', false),
('stem_borer', 'paddy', 'Yellow Stem Borer (YSB)', 'ହଳଦିଆ ମଜା ପୋକ', 'Scirpophaga incertulas (Walker)', 'ମଜା ପୋକ / କାଣ୍ଡ ବିନ୍ଧା ପୋକ', '20% - 60% (Dead Heart / White Earhead)', false),
('leaf_folder', 'paddy', 'Rice Leaf Folder', 'ପତ୍ରମୋଡ଼ା ପୋକ', 'Cnaphalocrocis medinalis (Guenée)', 'ପତ୍ରମୋଡ଼ା ପୋକ', '15% - 40%', false),
('rice_hispa', 'paddy', 'Rice Hispa', 'ହିସପା ପୋକ', 'Dicladispa armigera (Olivier)', 'ହିସପା କଣ୍ଟା ପୋକ', '20% - 50%', false),
('armyworm', 'paddy', 'Rice Armyworm', 'ଲେଡା ପୋକ / ସୈନ୍ୟ କୀଟ', 'Mythimna separata (Walker)', 'ଲେଡା ପୋକ / ଶିଁଷା କାଟୁଆ ପୋକ', '50% - 90%', false),
('beneficial_spider', 'paddy', 'Wolf Spider', 'କଲମ ବୁଢ଼ିଆଣୀ (ପରମ ବନ୍ଧୁ)', 'Lycosa pseudoannulata', 'ଶିକାରୀ ବୁଢ଼ିଆଣୀ', '0% (Beneficial predator)', true),
('healthy_paddy', 'paddy', 'Healthy Paddy Crop', 'ନିରୋଗ ଧାନ ଗଛ', 'Oryza sativa L.', 'ସୁସ୍ଥ ଧାନ ଗଛ', '0%', true)
ON CONFLICT (id) DO NOTHING;
