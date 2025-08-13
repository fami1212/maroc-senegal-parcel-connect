-- Create enum for transport types
CREATE TYPE public.transport_type AS ENUM ('avion', 'voiture', 'camion', 'bus');

-- Create enum for shipment status
CREATE TYPE public.shipment_status AS ENUM ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled');

-- Create enum for trip status  
CREATE TYPE public.trip_status AS ENUM ('open', 'full', 'in_progress', 'completed', 'cancelled');

-- Create expeditions table (demandes d'expédition des clients)
CREATE TABLE public.expeditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  weight_kg DECIMAL(10,2) NOT NULL,
  dimensions_cm TEXT, -- Format: "L x W x H"
  content_type TEXT NOT NULL,
  departure_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  preferred_date DATE,
  transport_type public.transport_type,
  max_budget DECIMAL(10,2),
  photos TEXT[], -- Array of photo URLs
  status public.shipment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create trips table (trajets proposés par les transporteurs)
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporteur_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  departure_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME,
  transport_type public.transport_type NOT NULL,
  available_weight_kg DECIMAL(10,2) NOT NULL,
  available_volume_m3 DECIMAL(10,2),
  price_per_kg DECIMAL(10,2) NOT NULL,
  vehicle_info TEXT,
  status public.trip_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create reservations table (liaison entre expeditions et trips)
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transporteur_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_price DECIMAL(10,2) NOT NULL,
  status public.shipment_status DEFAULT 'pending',
  tracking_code TEXT UNIQUE DEFAULT CONCAT('GC', EXTRACT(EPOCH FROM now())::bigint),
  pickup_address TEXT,
  delivery_address TEXT,
  pickup_date TIMESTAMPTZ,
  delivery_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(expedition_id, trip_id)
);

-- Create messages table (chat entre client et transporteur)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create reviews table (avis et notes)
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(reservation_id, reviewer_id)
);

-- Enable RLS on all tables
ALTER TABLE public.expeditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expeditions
CREATE POLICY "Users can view expeditions" ON public.expeditions
  FOR SELECT USING (true);

CREATE POLICY "Clients can create expeditions" ON public.expeditions
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their expeditions" ON public.expeditions
  FOR UPDATE USING (auth.uid() = client_id);

-- RLS Policies for trips
CREATE POLICY "Users can view trips" ON public.trips
  FOR SELECT USING (true);

CREATE POLICY "Transporteurs can create trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = transporteur_id);

CREATE POLICY "Transporteurs can update their trips" ON public.trips
  FOR UPDATE USING (auth.uid() = transporteur_id);

-- RLS Policies for reservations
CREATE POLICY "Users can view their reservations" ON public.reservations
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = transporteur_id);

CREATE POLICY "Clients can create reservations" ON public.reservations
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their reservations" ON public.reservations
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = transporteur_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages from their reservations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reservations r 
      WHERE r.id = reservation_id 
      AND (r.client_id = auth.uid() OR r.transporteur_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for reviews
CREATE POLICY "Users can view all reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Add triggers for updated_at
CREATE TRIGGER update_expeditions_updated_at
  BEFORE UPDATE ON public.expeditions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_expeditions_client_id ON public.expeditions(client_id);
CREATE INDEX idx_expeditions_status ON public.expeditions(status);
CREATE INDEX idx_trips_transporteur_id ON public.trips(transporteur_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_departure_date ON public.trips(departure_date);
CREATE INDEX idx_reservations_expedition_id ON public.reservations(expedition_id);
CREATE INDEX idx_reservations_trip_id ON public.reservations(trip_id);
CREATE INDEX idx_messages_reservation_id ON public.messages(reservation_id);
CREATE INDEX idx_reviews_reviewed_id ON public.reviews(reviewed_id);