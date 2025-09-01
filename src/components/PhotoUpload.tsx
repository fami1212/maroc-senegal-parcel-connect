import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  bucketName: string;
  folder?: string;
}

const PhotoUpload = ({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5, 
  bucketName,
  folder = "photos"
}: PhotoUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadPhoto = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos autorisées`);
      return;
    }

    setUploading(true);
    const newPhotos: string[] = [];

    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB max
          toast.error(`${file.name} est trop volumineux (max 5MB)`);
          continue;
        }

        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} n'est pas une image valide`);
          continue;
        }

        const url = await uploadPhoto(file);
        if (url) newPhotos.push(url);
      }

      onPhotosChange([...photos, ...newPhotos]);
      toast.success(`${newPhotos.length} photo(s) ajoutée(s)`);
    } catch (error: any) {
      toast.error("Erreur lors de l'upload : " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const capturePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= maxPhotos}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Sélectionner photos
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={capturePhoto}
          disabled={uploading || photos.length >= maxPhotos}
          className="flex-1"
        >
          <Camera className="w-4 h-4 mr-2" />
          Prendre photo
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <Card key={index} className="relative p-2">
              <div className="aspect-square relative">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                  onClick={() => removePhoto(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <Card className="border-2 border-dashed border-muted-foreground/25 p-8">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4" />
            <p>Aucune photo ajoutée</p>
            <p className="text-xs mt-1">Cliquez sur les boutons ci-dessus pour ajouter des photos</p>
          </div>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {photos.length}/{maxPhotos} photos • Max 5MB par photo
      </p>

      {uploading && (
        <div className="text-center text-sm text-muted-foreground">
          Upload en cours...
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;