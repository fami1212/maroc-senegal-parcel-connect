import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RatingSystemProps {
  reservationId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  onReviewSubmitted?: () => void;
}

const RatingSystem = ({ 
  reservationId, 
  reviewedUserId, 
  reviewedUserName,
  onReviewSubmitted 
}: RatingSystemProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const submitReview = async () => {
    if (!user || rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          reservation_id: reservationId,
          reviewer_id: user.id,
          reviewed_id: reviewedUserId,
          rating,
          comment: comment.trim() || null
        });

      if (error) throw error;

      toast.success("Avis soumis avec succès !");
      setIsOpen(false);
      setRating(0);
      setComment("");
      onReviewSubmitted?.();
    } catch (error: any) {
      toast.error("Erreur lors de la soumission : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ interactive = false }: { interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            star <= (interactive ? (hoverRating || rating) : rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          }`}
          onClick={interactive ? () => setRating(star) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Star className="w-4 h-4 mr-2" />
          Noter {reviewedUserName}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Noter {reviewedUserName}</DialogTitle>
          <CardDescription>
            Votre avis aide les autres utilisateurs
          </CardDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Comment évaluez-vous cette expérience ?
            </p>
            <StarRating interactive />
            {rating > 0 && (
              <p className="text-sm mt-2 font-medium">
                {rating === 1 && "Très insatisfait"}
                {rating === 2 && "Insatisfait"}
                {rating === 3 && "Correct"}
                {rating === 4 && "Satisfait"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Commentaire (optionnel)
            </label>
            <Textarea
              placeholder="Partagez votre expérience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 caractères
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={submitReview}
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? "Envoi..." : "Soumettre"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Composant pour afficher les avis existants
interface ReviewDisplayProps {
  userId: string;
  showTitle?: boolean;
}

export const ReviewDisplay = ({ userId, showTitle = true }: ReviewDisplayProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(first_name, last_name)
      `)
      .eq("reviewed_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  useState(() => {
    fetchReviews();
  });

  if (loading) {
    return <div className="text-center text-sm text-muted-foreground">Chargement des avis...</div>;
  }

  return (
    <div className="space-y-4">
      {showTitle && reviews.length > 0 && (
        <h3 className="font-semibold text-lg">Avis clients</h3>
      )}
      
      {reviews.map((review) => (
        <Card key={review.id} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {review.comment && (
            <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
          )}
          
          <p className="text-xs text-muted-foreground">
            Par {review.reviewer?.first_name} {review.reviewer?.last_name}
          </p>
        </Card>
      ))}

      {reviews.length === 0 && (
        <p className="text-center text-muted-foreground text-sm">
          Aucun avis pour le moment
        </p>
      )}
    </div>
  );
};

export default RatingSystem;