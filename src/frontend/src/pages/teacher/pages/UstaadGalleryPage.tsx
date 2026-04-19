import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Image, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type GalleryItem,
  createId,
  getGallery,
  saveGallery,
} from "../../../lib/storage";

interface Props {
  teacherName: string;
  onBack: () => void;
}

export default function UstaadGalleryPage({ teacherName, onBack }: Props) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<"image" | "video">("image");

  const loadItems = useCallback(() => {
    const all = getGallery();
    const filtered = all.filter(
      (g) =>
        !g.uploadedBy ||
        g.uploadedBy === "Admin" ||
        g.uploadedBy === teacherName,
    );
    setItems(filtered);
  }, [teacherName]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAdd = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const item: GalleryItem = {
      id: createId(),
      title: newTitle.trim(),
      url: newUrl.trim() || "/assets/images/placeholder.svg",
      type: newType,
      addedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: teacherName,
    };

    const all = getGallery();
    all.push(item);
    saveGallery(all);
    toast.success("Item added to gallery");
    setShowAdd(false);
    setNewTitle("");
    setNewUrl("");
    setNewType("image");
    loadItems();
  };

  const handleRemove = (id: string) => {
    const item = items.find((g) => g.id === id);
    if (item?.uploadedBy !== teacherName) {
      toast.error("You can only remove your own gallery items");
      return;
    }
    const all = getGallery().filter((g) => g.id !== id);
    saveGallery(all);
    toast.success("Item removed");
    loadItems();
  };

  return (
    <div data-ocid="teacher.gallery.page" className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid="teacher.gallery.back_button"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Class Gallery</h1>
          <p className="text-muted-foreground text-sm">
            Photos and media from your class
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAdd((p) => !p)}
          data-ocid="teacher.gallery.add_button"
          className="gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {showAdd && (
        <Card
          className="shadow-card border-primary/30"
          data-ocid="teacher.gallery.add_form"
        >
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">Add Gallery Item</p>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="teacher.gallery.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gallery-title">Title *</Label>
                <Input
                  id="gallery-title"
                  data-ocid="teacher.gallery.title.input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Class Activity April 2026"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gallery-type">Type</Label>
                <Select
                  value={newType}
                  onValueChange={(v) => setNewType(v as "image" | "video")}
                >
                  <SelectTrigger
                    id="gallery-type"
                    data-ocid="teacher.gallery.type.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="gallery-url">Image URL (optional)</Label>
                <Input
                  id="gallery-url"
                  data-ocid="teacher.gallery.url.input"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use placeholder
                </p>
              </div>
            </div>

            <Button
              onClick={handleAdd}
              data-ocid="teacher.gallery.submit_button"
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add to Gallery
            </Button>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <div
          className="text-center py-16 bg-card rounded-xl border border-border"
          data-ocid="teacher.gallery.empty_state"
        >
          <Image className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">No gallery items</p>
          <p className="text-sm text-muted-foreground">
            Add photos or videos from your class activities
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <Card
              key={item.id}
              data-ocid={`teacher.gallery.item.${i + 1}`}
              className="shadow-card hover:shadow-card-hover transition-shadow overflow-hidden group"
            >
              <div className="relative bg-muted h-40">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/assets/images/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                {item.uploadedBy === teacherName && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    data-ocid={`teacher.gallery.delete_button.${i + 1}`}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    aria-label="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm text-foreground truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {item.addedAt}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                    {item.type}
                  </Badge>
                  {item.uploadedBy && item.uploadedBy !== "Admin" && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-4 px-1.5 bg-primary/5 text-primary border-primary/20"
                    >
                      Mine
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
