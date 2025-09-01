-- Ajout de nouvelles tables pour les fonctionnalités manquantes

-- Table pour le storage des documents et photos
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('expedition-photos', 'expedition-photos', true),
  ('kyc-documents', 'kyc-documents', false),
  ('delivery-proofs', 'delivery-proofs', false);

-- Politiques pour expedition-photos (public)
CREATE POLICY "Public can view expedition photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'expedition-photos');

CREATE POLICY "Users can upload expedition photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'expedition-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques pour kyc-documents (privé)
CREATE POLICY "Users can view own KYC documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own KYC documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques pour delivery-proofs (privé)
CREATE POLICY "Users can view delivery proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'delivery-proofs' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (SELECT 1 FROM reservations r WHERE r.id::text = (storage.foldername(name))[2] AND (r.client_id = auth.uid() OR r.transporteur_id = auth.uid()))
  ));

CREATE POLICY "Transporters can upload delivery proofs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'delivery-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Table pour le tracking GPS en temps réel
CREATE TABLE public.tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  transporteur_id UUID NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  status TEXT DEFAULT 'in_transit', -- 'pickup', 'in_transit', 'delivered'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  address TEXT,
  notes TEXT
);

-- RLS pour tracking
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking of their reservations" ON public.tracking
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM reservations r WHERE r.id = tracking.reservation_id AND (r.client_id = auth.uid() OR r.transporteur_id = auth.uid()))
  );

CREATE POLICY "Transporters can insert tracking" ON public.tracking
  FOR INSERT WITH CHECK (auth.uid() = transporteur_id);

-- Table pour KYC (vérification d'identité)
CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.document_type AS ENUM ('passport', 'national_id', 'driving_license');

CREATE TABLE public.kyc_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_number TEXT NOT NULL,
  document_url TEXT NOT NULL, -- URL du fichier dans storage
  status kyc_status DEFAULT 'pending',
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_type)
);

-- RLS pour KYC
ALTER TABLE public.kyc_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own KYC" ON public.kyc_verification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC" ON public.kyc_verification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC" ON public.kyc_verification
  FOR UPDATE USING (auth.uid() = user_id);

-- Table pour les paiements
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE public.payment_method AS ENUM ('stripe', 'mobile_money', 'cash', 'paypal');

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  transporteur_id UUID NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'MAD',
  payment_method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  commission_amount DECIMAL DEFAULT 0,
  transporteur_amount DECIMAL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS pour payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = transporteur_id);

-- Table pour les preuves de livraison
CREATE TABLE public.delivery_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  transporteur_id UUID NOT NULL,
  photo_url TEXT NOT NULL, -- URL dans storage
  signature_data TEXT, -- Données de signature numérique (base64)
  recipient_name TEXT,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS pour delivery_proofs
ALTER TABLE public.delivery_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view delivery proofs of their reservations" ON public.delivery_proofs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM reservations r WHERE r.id = delivery_proofs.reservation_id AND (r.client_id = auth.uid() OR r.transporteur_id = auth.uid()))
  );

CREATE POLICY "Transporters can insert delivery proofs" ON public.delivery_proofs
  FOR INSERT WITH CHECK (auth.uid() = transporteur_id);

-- Table pour les notifications
CREATE TYPE public.notification_type AS ENUM ('reservation_created', 'reservation_confirmed', 'pickup_ready', 'in_transit', 'delivered', 'payment_received', 'message_received');

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Données supplémentaires (reservation_id, etc.)
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS pour notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Ajout de colonnes manquantes dans profiles pour KYC
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';

-- Ajout de colonnes pour les revenus des transporteurs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_earnings DECIMAL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_deliveries INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS average_rating DECIMAL DEFAULT 0;

-- Triggers pour updated_at
CREATE TRIGGER update_kyc_verification_updated_at
  BEFORE UPDATE ON public.kyc_verification
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour performance
CREATE INDEX idx_tracking_reservation_id ON public.tracking(reservation_id);
CREATE INDEX idx_tracking_timestamp ON public.tracking(timestamp DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_payments_reservation_id ON public.payments(reservation_id);
CREATE INDEX idx_kyc_user_id ON public.kyc_verification(user_id);