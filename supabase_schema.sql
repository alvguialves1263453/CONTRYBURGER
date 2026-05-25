-- =========================================================================
-- CONTY FOOD - SUPABASE SCHEMA SETUP SQL
-- This file defines the complete database structure, security headers, Row Level
-- Security (RLS) policies, triggers, custom SQL functions, procedures, views
-- and initialization seeds to build the entire rancho backend.
-- =========================================================================

-- Enable Extension for UUID Generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA PROFILES (Linked directly to Supabase Auth Users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'cliente' CONSTRAINT check_role CHECK (role IN ('admin', 'cliente')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA CATEGORIAS
CREATE TABLE public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    icon TEXT,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA PRODUTOS
CREATE TABLE public.produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_slug TEXT NOT NULL REFERENCES public.categorias(slug) ON UPDATE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    promo_price NUMERIC(10,2),
    badge TEXT,
    image_url TEXT NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    estimated_time TEXT NOT NULL DEFAULT '25-30 min',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_promo BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sales_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA PRODUTO_IMAGENS (Gallery support)
CREATE TABLE public.produto_imagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA CARRINHO
CREATE TABLE public.carrinho (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABELA CARRINHO_ITENS
CREATE TABLE public.carrinho_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrinho_id UUID NOT NULL REFERENCES public.carrinho(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CONSTRAINT check_quantity CHECK (quantity > 0),
    obs TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_carrinho_produto UNIQUE (carrinho_id, produto_id)
);

-- 7. TABELA PEDIDOS
CREATE TABLE public.pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Pix',
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pendente' CONSTRAINT check_status CHECK (status IN ('pendente', 'em_preparo', 'enviado', 'entregue', 'cancelado')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABELA PEDIDO_ITENS
CREATE TABLE public.pedido_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL CONSTRAINT check_item_qty CHECK (quantity > 0),
    obs TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TABELA CUPONS
CREATE TABLE public.cupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'percent' CONSTRAINT check_coupon_type CHECK (type IN ('percent', 'fixed')),
    value NUMERIC(10,2) NOT NULL,
    expiry_date DATE NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 100,
    current_uses INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TABELA BANNERS
CREATE TABLE public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TABELA AVALIACOES
CREATE TABLE public.avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TABELA FAVORITOS
CREATE TABLE public.favoritos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_favorite_product UNIQUE (user_id, produto_id)
);

-- 13. TABELA CONFIGURACOES (System Configuration)
CREATE TABLE public.configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. TABELA NOTIFICACOES
CREATE TABLE public.notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================================
-- TRIGGERS PARA AUTO UPDATE TIMESTAMPS
-- =========================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_categorias_timestamp BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_produtos_timestamp BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_carrinho_timestamp BEFORE UPDATE ON public.carrinho FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_carrinho_itens_timestamp BEFORE UPDATE ON public.carrinho_itens FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_pedidos_timestamp BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_cupons_timestamp BEFORE UPDATE ON public.cupons FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_banners_timestamp BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION update_modified_column();


-- =========================================================================
-- TRIGGER AUTOMÁTICO DE CADASTRO: auth.users -> profiles
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Ginete do Rancho'),
    CASE 
      WHEN NEW.email = 'admin@contryfood.com' THEN 'admin'
      ELSE 'cliente'
    END
  );
  
  -- Inicializar um carrinho automaticamente para o cliente
  INSERT INTO public.carrinho (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =========================================================================
-- ÍNDICES DE PERFORMANCE E CHAVES SECUNDÁRIAS
-- =========================================================================
CREATE INDEX idx_produtos_categoria_slug ON public.produtos(categoria_slug);
CREATE INDEX idx_produtos_is_featured ON public.produtos(is_featured);
CREATE INDEX idx_produtos_is_promo ON public.produtos(is_promo);
CREATE INDEX idx_produtos_is_active ON public.produtos(is_active);
CREATE INDEX idx_pedidos_user_id ON public.pedidos(user_id);
CREATE INDEX idx_pedidos_status ON public.pedidos(status);
CREATE INDEX idx_pedido_itens_pedido_id ON public.pedido_itens(pedido_id);
CREATE INDEX idx_avaliacoes_produto_id ON public.avaliacoes(produto_id);
CREATE INDEX idx_favoritos_user_id ON public.favoritos(user_id);
CREATE INDEX idx_carrinho_user_id ON public.carrinho(user_id);
CREATE INDEX idx_carrinho_itens_carrinho_id ON public.carrinho_itens(carrinho_id);


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrinho ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrinho_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- HELPER ROLE FUNCTION
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Qualquer um logado lê seu perfil. Admin lê tudo." ON public.profiles
    FOR SELECT USING (auth.uid() = id OR get_user_role() = 'admin');

CREATE POLICY "Usuários atualizam seus dados. Admin atualiza tudo." ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR get_user_role() = 'admin');

-- 2. Categorias Policies
CREATE POLICY "Leitura pública de categorias" ON public.categorias
    FOR SELECT USING (true);

CREATE POLICY "Apenas admin edita categorias" ON public.categorias
    FOR ALL USING (get_user_role() = 'admin');

-- 3. Produtos Policies
CREATE POLICY "Leitura pública de produtos ativos" ON public.produtos
    FOR SELECT USING (is_active = true OR get_user_role() = 'admin');

CREATE POLICY "Apenas admin edita produtos" ON public.produtos
    FOR ALL USING (get_user_role() = 'admin');

-- 4. Produto Imagens Policies
CREATE POLICY "Leitura pública de imagens" ON public.produto_imagens
    FOR SELECT USING (true);

CREATE POLICY "Apenas admin manipula imagens" ON public.produto_imagens
    FOR ALL USING (get_user_role() = 'admin');

-- 5. Carrinho Policies
CREATE POLICY "Dono acessa seu carrinho" ON public.carrinho
    FOR ALL USING (auth.uid() = user_id OR get_user_role() = 'admin');

-- 6. Carrinho Itens Policies
CREATE POLICY "Dono edita itens do seu carrinho" ON public.carrinho_itens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.carrinho 
            WHERE carrinho.id = carrinho_itens.carrinho_id AND carrinho.user_id = auth.uid()
        ) OR get_user_role() = 'admin'
    );

-- 7. Pedidos Policies
CREATE POLICY "Dono vê seus pedidos e Admin vê todos" ON public.pedidos
    FOR SELECT USING (auth.uid() = user_id OR get_user_role() = 'admin');

CREATE POLICY "Usuários criam seus pedidos e Admin gerencia tudo" ON public.pedidos
    FOR INSERT WITH CHECK (auth.uid() = user_id OR get_user_role() = 'admin' OR auth.uid() IS NULL);

CREATE POLICY "Apenas admin gerencia pedidos" ON public.pedidos
    FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "Apenas admin exclui pedidos" ON public.pedidos
    FOR DELETE USING (get_user_role() = 'admin');

-- 8. Pedido Itens Policies
CREATE POLICY "Acesso aos itens conectado a RLS de pedidos" ON public.pedido_itens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pedidos 
            WHERE pedidos.id = pedido_itens.pedido_id AND (pedidos.user_id = auth.uid() OR get_user_role() = 'admin')
        )
    );

CREATE POLICY "Inserção livre conectada a criação do pedido" ON public.pedido_itens
    FOR INSERT WITH CHECK (true);

-- 9. Cupons Policies
CREATE POLICY "Visualização de cupons por autenticados na hora da compra" ON public.cupons
    FOR SELECT USING (true);

CREATE POLICY "Apenas admin manipula cupons" ON public.cupons
    FOR ALL USING (get_user_role() = 'admin');

-- 10. Banners Policies
CREATE POLICY "Leitura pública de banners ativos" ON public.banners
    FOR SELECT USING (is_active = true OR get_user_role() = 'admin');

CREATE POLICY "Apenas admin gerencia banners" ON public.banners
    FOR ALL USING (get_user_role() = 'admin');

-- 11. Avaliacoes Policies
CREATE POLICY "Leitura pública de avaliações" ON public.avaliacoes
    FOR SELECT USING (true);

CREATE POLICY "Apenas logados inserem avaliações" ON public.avaliacoes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Apenas admin ou autor atualiza/exclui avaliação" ON public.avaliacoes
    FOR ALL USING (auth.uid() = user_id OR get_user_role() = 'admin');

-- 12. Favoritos Policies
CREATE POLICY "Dono gerencia seus favoritos" ON public.favoritos
    FOR ALL USING (auth.uid() = user_id OR get_user_role() = 'admin');

-- 13. Configuracoes Policies
CREATE POLICY "Leitura pública das configurações do restaurante" ON public.configuracoes
    FOR SELECT USING (true);

CREATE POLICY "Apenas admin gerencia configurações" ON public.configuracoes
    FOR ALL USING (get_user_role() = 'admin');

-- 14. Notificacoes Policies
CREATE POLICY "Usuário lê suas próprias notificações" ON public.notificacoes
    FOR ALL USING (auth.uid() = user_id OR get_user_role() = 'admin');


-- =========================================================================
-- VIEWS SQL PARA REPORTING E PAINEL ADMIN
-- =========================================================================

-- View para dashboard de estatísticas
CREATE OR REPLACE VIEW public.vw_dashboard_stats AS
SELECT 
    COALESCE(SUM(CASE WHEN status != 'cancelado' THEN total ELSE 0 END), 0) AS total_revenue,
    COUNT(id) AS total_orders,
    COUNT(CASE WHEN status = 'entregue' THEN 1 END) AS completed_orders,
    COUNT(CASE WHEN status IN ('pendente', 'em_preparo') THEN 1 END) AS pending_orders,
    CASE 
        WHEN COUNT(id) > 0 THEN COALESCE(SUM(CASE WHEN status != 'cancelado' THEN total ELSE 0 END), 0) / COUNT(CASE WHEN status != 'cancelado' THEN 1 END)
        ELSE 0
    END AS average_ticket
FROM public.pedidos;

-- View para resumo semanal de faturamento
CREATE OR REPLACE VIEW public.vw_revenue_weekly AS
SELECT 
    TO_CHAR(timestamp, 'Dy DD') AS day_label,
    COALESCE(SUM(total), 0) as total_day,
    COUNT(id) as count_day
FROM public.pedidos
WHERE timestamp >= NOW() - INTERVAL '7 days' AND status != 'cancelado'
GROUP BY TO_CHAR(timestamp, 'Dy DD'), DATE_TRUNC('day', timestamp)
ORDER BY DATE_TRUNC('day', timestamp);


-- =========================================================================
-- SEED DATA DE INICIALIZAÇÃO
-- =========================================================================

-- Seed de Categorias do Rancho
INSERT INTO public.categorias (slug, label, icon, ordem) VALUES
('all', 'Todos', '🤠', 1),
('burgers', 'Hambúrgueres', '🍔', 2),
('combos', 'Combos Caipiras', '📦', 3),
('sides', 'Acompanhamentos', '🍟', 4),
('drinks', 'Bebidas', '🍹', 5),
('desserts', 'Sobremesas', '🥧', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed das Configurações Iniciais da Loja
INSERT INTO public.configuracoes (key, value, description) VALUES
('store_general', '{"whatsappNumber": "5511999999999", "storeOpen": true, "estimatedDeliveryTime": "35-50 min", "deliveryFee": 7.00}', 'Informações fundamentais e contatos do rancho')
ON CONFLICT (key) DO NOTHING;

-- Seed de Cupons iniciais
INSERT INTO public.cupons (code, type, value, expiry_date, max_uses, current_uses, is_active) VALUES
('XERIFE10', 'percent', 10.00, '2027-12-31', 500, 0, TRUE),
('COWBOY20', 'fixed', 20.00, '2027-12-31', 100, 0, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Seed dos Banners iniciais
INSERT INTO public.banners (id, title, subtitle, image_url, link_url, is_active, ordem) VALUES
('b1000000-0000-0000-0000-000000000001', 'Sabor Lendário', 'Hambúrgueres assados e defumados na brasa', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', '#cardapio', TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- Seed de Hambúrgueres do Rancho (Deixado em branco para cadastro manual)
-- Nenhum produto padrão foi inserido para que a tabela fique vazia para sua configuração preferencial.
