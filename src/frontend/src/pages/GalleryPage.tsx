import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type GalleryItem,
  type Session,
  createId,
  getGallery,
  saveGallery,
} from "@/lib/storage";
import { CLASS_LIST } from "@/types/index";
import { Image, Plus, Trash2, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface GalleryPageProps {
  session: Session;
}

interface AddForm {
  title: string;
  url: string;
  type: "image" | "video";
}

const EMPTY_FORM: AddForm = { title: "", url: "", type: "image" };

export default function GalleryPage({ session }: GalleryPageProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [classFilter, setClassFilter] = useState<string>("all");

  useEffect(() => {
    getGallery()
      .then((data) =>
        setItems(
          data.sort(
            (a, b) =>
              new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
          ),
        ),
      )
      .catch(() => setItems([]));
  }, []);

  const isAdmin = session.role === "admin";
  const isTeacher = session.role === "teacher";
  const canUpload = isAdmin || isTeacher;

  // Teacher's assigned class from session
  const teacherClass = session.teacherClass ?? "";

  // Can this session delete a particular item?
  const canDelete = (item: GalleryItem): boolean => {
    if (isAdmin) return true;
    if (isTeacher) return item.uploadedBy === session.name;
    return false;
  };

  // Filtered items
  const filteredItems =
    classFilter === "all"
      ? items
      : items.filter((item) => item.classTag === classFilter);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    const newItem: GalleryItem = {
      id: createId(),
      title: form.title.trim(),
      url: form.url.trim() || "/assets/images/placeholder.svg",
      type: form.type,
      addedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: isTeacher ? session.name : "Admin",
      classTag: isTeacher ? teacherClass : undefined,
    };
    const updated = [newItem, ...items];
    setItems(updated);
    await saveGallery(updated);
    setForm(EMPTY_FORM);
    setShowAdd(false);
    toast.success("Item added to gallery");
  };

  const handleDelete = async (item: GalleryItem) => {
    const updated = items.filter((i) => i.id !== item.id);
    setItems(updated);
    await saveGallery(updated);
    setDeleteTarget(null);
    toast.success("Item removed from gallery");
  };

  return (
    <div className="space-y-5 page-enter" data-ocid="gallery.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gallery</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
            {classFilter !== "all" ? ` in ${classFilter}` : " in the gallery"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter by Class */}
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger
              className="w-44 h-9 text-sm"
              data-ocid="gallery.class_filter.select"
            >
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {CLASS_LIST.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Upload button — admin or teacher */}
          {canUpload && (
            <Button
              type="button"
              className="btn-green gap-2 shadow-sm h-9"
              onClick={() => setShowAdd(true)}
              data-ocid="gallery.add_button"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isTeacher ? "Upload to My Class" : "Add to Gallery"}
              </span>
              <span className="sm:hidden">Upload</span>
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="gallery.list"
        >
          {filteredItems.map((item, i) => (
            <Card
              key={item.id}
              className="card-interactive group relative overflow-hidden"
              data-ocid={`gallery.item.${i + 1}`}
            >
              {/* Delete button — visible to admin (all) or teacher (own items only) */}
              {canDelete(item) && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-md flex items-center justify-center bg-card/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={`Delete "${item.title}"`}
                  data-ocid={`gallery.delete_button.${i + 1}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Thumbnail */}
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {item.url && item.url !== "/assets/images/placeholder.svg" ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/assets/images/placeholder.svg";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-muted">
                    {item.type === "video" ? (
                      <Video className="w-10 h-10 text-muted-foreground/40" />
                    ) : (
                      <Image className="w-10 h-10 text-muted-foreground/40" />
                    )}
                  </div>
                )}
              </div>

              <CardContent className="p-3 space-y-1.5">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1">
                  {/* Type badge */}
                  <span
                    className={[
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                      item.type === "video"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-green-50 text-green-700 border-green-200",
                    ].join(" ")}
                  >
                    {item.type === "video" ? (
                      <Video className="w-2.5 h-2.5" />
                    ) : (
                      <Image className="w-2.5 h-2.5" />
                    )}
                    {item.type === "video" ? "Video" : "Image"}
                  </span>

                  {/* Class badge */}
                  {item.classTag && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-primary/10 text-primary border-primary/20">
                      {item.classTag}
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                  {item.title}
                </p>

                {/* Date */}
                <p className="text-[10px] text-muted-foreground">
                  {new Date(item.addedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-20 gap-4 text-center card-base rounded-xl"
          data-ocid="gallery.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Image className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No items yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              {canUpload
                ? classFilter !== "all"
                  ? `No gallery items for ${classFilter}. Upload one using the button above.`
                  : "Add photos or videos to the gallery using the button above."
                : classFilter !== "all"
                  ? `No gallery items for ${classFilter}.`
                  : "No gallery items have been added yet."}
            </p>
          </div>
        </div>
      )}

      {/* Add / Upload Dialog */}
      <Dialog
        open={showAdd}
        onOpenChange={(o) => {
          setShowAdd(o);
          if (!o) setForm(EMPTY_FORM);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          data-ocid="gallery.add_modal.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </span>
              {isTeacher ? "Upload to My Class" : "Add to Gallery"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="gallery-title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="gallery-title"
                placeholder="Enter a descriptive title…"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="gallery.title.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gallery-url" className="text-sm font-medium">
                Image URL{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="gallery-url"
                placeholder="https://example.com/image.jpg"
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                data-ocid="gallery.url.input"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use a placeholder image.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, type: v as "image" | "video" }))
                }
              >
                <SelectTrigger data-ocid="gallery.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    <span className="flex items-center gap-2">
                      <Image className="w-3.5 h-3.5" /> Image
                    </span>
                  </SelectItem>
                  <SelectItem value="video">
                    <span className="flex items-center gap-2">
                      <Video className="w-3.5 h-3.5" /> Video
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Class tag — auto-filled for teachers (read-only), hidden for admin */}
            {isTeacher && teacherClass && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Class</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-muted/50">
                  <span className="text-sm text-foreground">
                    {teacherClass}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    Auto-assigned
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This upload will be tagged to your class.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowAdd(false);
                setForm(EMPTY_FORM);
              }}
              data-ocid="gallery.add_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 btn-green"
              onClick={handleAdd}
              disabled={!form.title.trim()}
              data-ocid="gallery.add_modal.confirm_button"
            >
              {isTeacher ? "Upload" : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(o) => {
            if (!o) setDeleteTarget(null);
          }}
        >
          <DialogContent
            className="sm:max-w-sm"
            data-ocid="gallery.delete_confirm.dialog"
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </span>
                <span className="text-destructive">Remove Item</span>
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-1">
              Remove{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteTarget.title}&rdquo;
              </span>{" "}
              from the gallery? This cannot be undone.
            </p>
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteTarget(null)}
                data-ocid="gallery.delete_confirm.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(deleteTarget)}
                data-ocid="gallery.delete_confirm.confirm_button"
              >
                Remove
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
