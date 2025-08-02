-- =====================================
-- SISTEMA DE RESEÑAS - BOLAO WEB
-- CORRECCIÓN: Solo agregar funcionalidades faltantes
-- =====================================

-- Índices para optimizar consultas (si no existen)
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON public.reviews USING btree (place_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_reviews_profile_id ON public.reviews USING btree (profile_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews USING btree (rating) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews USING btree (created_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email) TABLESPACE pg_default;

-- Función para actualizar score promedio en places
CREATE OR REPLACE FUNCTION update_place_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular nuevo promedio y total de reviews para el place
    UPDATE public.places 
    SET 
        score = (
            SELECT COALESCE(AVG(rating::numeric), 0)
            FROM public.reviews 
            WHERE place_id = COALESCE(NEW.place_id, OLD.place_id) 
            AND is_active = true
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM public.reviews 
            WHERE place_id = COALESCE(NEW.place_id, OLD.place_id) 
            AND is_active = true
        ),
        updated_at = timezone('utc'::text, now())
    WHERE id = COALESCE(NEW.place_id, OLD.place_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar automáticamente el score
CREATE TRIGGER trigger_update_place_score_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_place_score();

CREATE TRIGGER trigger_update_place_score_update
    AFTER UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_place_score();

CREATE TRIGGER trigger_update_place_score_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_place_score();

-- Comentarios sobre el diseño:
-- 1. profiles: Tabla separada para usuarios que hacen reseñas (no business accounts)
-- 2. reviews: Constraint único por place_id + profile_id (una reseña por usuario por lugar)
-- 3. rating: Validado entre 1-5 estrellas
-- 4. Triggers automáticos: Actualizan score y total_reviews en places
-- 5. Índices optimizados: Para consultas rápidas por lugar, usuario, rating y fecha
-- 6. Soft delete: Campo is_active para no eliminar datos históricos