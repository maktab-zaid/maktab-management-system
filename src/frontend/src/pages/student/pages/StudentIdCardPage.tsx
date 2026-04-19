import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStudents } from "@/lib/storage";
import { CreditCard, Download, Upload } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  mobileNumber: string;
}

interface IdCardData {
  studentName: string;
  fatherName: string;
  mobileNumber: string;
  address: string;
  session: string;
  ustaadName: string;
  photo: string | null;
}

export default function StudentIdCardPage({ mobileNumber }: Props) {
  const localStudent = getStudents().find(
    (s) => s.parentMobile === mobileNumber,
  );

  const [formData, setFormData] = useState<IdCardData>({
    studentName: localStudent?.name || "",
    fatherName: localStudent?.fatherName || "",
    mobileNumber: localStudent?.parentMobile || mobileNumber,
    address: localStudent?.address || "",
    session: localStudent?.timeSlot
      ? localStudent.timeSlot.charAt(0).toUpperCase() +
        localStudent.timeSlot.slice(1)
      : "",
    ustaadName: localStudent?.teacherName || "",
    photo: null,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, photo: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const { default: jsPDF } = await import("jspdf");

    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL("image/png");
    // Standard ID card: 85.6mm × 54mm (CR80)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85.6, 54],
    });
    doc.addImage(imgData, "PNG", 0, 0, 85.6, 54);
    doc.save(`ID_Card_${formData.studentName || "Student"}.pdf`);
  };

  return (
    <div data-ocid="student.idcard.page" className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" /> Student ID Card
        </h1>
        <p className="text-muted-foreground text-sm">
          Fill in your details and download your official Maktab ID card
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── Form ── */}
        <div className="space-y-4">
          <h2 className="font-semibold text-sm text-foreground">
            Student Details
          </h2>

          {/* Photo upload */}
          <div className="space-y-1.5">
            <Label htmlFor="photo-upload">Student Photo</Label>
            <button
              type="button"
              className="flex items-center gap-3 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors w-full text-left"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Student"
                  className="w-16 h-16 object-cover rounded-full border-2 border-primary/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formData.photo ? "Change photo" : "Upload photo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              data-ocid="student.idcard.upload_button"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="student-name">Student Name</Label>
            <Input
              id="student-name"
              data-ocid="student.idcard.name_input"
              value={formData.studentName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, studentName: e.target.value }))
              }
              placeholder="Enter student name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="father-name">Father Name</Label>
            <Input
              id="father-name"
              data-ocid="student.idcard.father_input"
              value={formData.fatherName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, fatherName: e.target.value }))
              }
              placeholder="Enter father name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mobile-number">Mobile Number</Label>
            <Input
              id="mobile-number"
              data-ocid="student.idcard.mobile_input"
              value={formData.mobileNumber}
              onChange={(e) =>
                setFormData((p) => ({ ...p, mobileNumber: e.target.value }))
              }
              placeholder="Enter mobile number"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              data-ocid="student.idcard.address_input"
              value={formData.address}
              onChange={(e) =>
                setFormData((p) => ({ ...p, address: e.target.value }))
              }
              placeholder="Enter address"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Session</Label>
            <Select
              value={formData.session}
              onValueChange={(v) => setFormData((p) => ({ ...p, session: v }))}
            >
              <SelectTrigger data-ocid="student.idcard.session_select">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Afternoon">Afternoon</SelectItem>
                <SelectItem value="Evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ustaad-name">Ustaad Name</Label>
            <Input
              id="ustaad-name"
              data-ocid="student.idcard.ustaad_input"
              value={formData.ustaadName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, ustaadName: e.target.value }))
              }
              placeholder="Enter Ustaad name"
            />
          </div>

          <Button
            data-ocid="student.idcard.download_button"
            onClick={handleDownloadPDF}
            className="w-full gap-2"
          >
            <Download className="w-4 h-4" />
            Download ID Card as PDF
          </Button>
        </div>

        {/* ── ID Card Preview ── */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-foreground">Preview</h2>
          <p className="text-xs text-muted-foreground">
            Standard card size: 85.6mm × 54mm (CR80)
          </p>

          {/* Card preview — aspect ratio ~1.586:1 */}
          <div
            ref={cardRef}
            style={{ width: "342px", height: "216px" }}
            className="relative rounded-xl overflow-hidden shadow-xl select-none flex-shrink-0"
            data-ocid="student.idcard.preview"
          >
            {/* Green gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)",
              }}
            />

            {/* Decorative arcs */}
            <div
              className="absolute"
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                border: "2px solid rgba(255,215,0,0.15)",
                top: "-60px",
                right: "-40px",
              }}
            />
            <div
              className="absolute"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: "1.5px solid rgba(255,215,0,0.1)",
                bottom: "-30px",
                left: "-20px",
              }}
            />

            {/* Gold top strip */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: "linear-gradient(90deg, #d4af37, #f5d066, #d4af37)",
              }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col px-4 pt-3 pb-2">
              {/* Header */}
              <div className="text-center mb-2">
                <p
                  className="font-bold leading-tight"
                  style={{
                    color: "#f5d066",
                    fontSize: "10px",
                    letterSpacing: "0.5px",
                  }}
                >
                  🕌 MAKTAB ZAID BIN SABIT
                </p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "7px" }}>
                  Academic Year 2026–27
                </p>
              </div>

              {/* Body */}
              <div className="flex gap-3 flex-1">
                {/* Photo */}
                <div className="flex-shrink-0">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Student"
                      style={{
                        width: "60px",
                        height: "70px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "2px solid #d4af37",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "60px",
                        height: "70px",
                        borderRadius: "6px",
                        border: "2px solid #d4af37",
                        background: "rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "22px",
                        }}
                      >
                        👤
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div>
                    <p
                      className="font-bold truncate"
                      style={{ color: "#ffffff", fontSize: "11px" }}
                    >
                      {formData.studentName || "Student Name"}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "8px",
                      }}
                    >
                      S/O: {formData.fatherName || "Father Name"}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    {formData.session && (
                      <p style={{ color: "#f5d066", fontSize: "8px" }}>
                        📅 Session: {formData.session}
                      </p>
                    )}
                    {formData.ustaadName && (
                      <p
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "8px",
                        }}
                      >
                        👨‍🏫 {formData.ustaadName}
                      </p>
                    )}
                    {formData.mobileNumber && (
                      <p
                        style={{
                          color: "rgba(255,255,255,0.65)",
                          fontSize: "7.5px",
                        }}
                      >
                        📱 {formData.mobileNumber}
                      </p>
                    )}
                    {formData.address && (
                      <p
                        className="truncate"
                        style={{
                          color: "rgba(255,255,255,0.55)",
                          fontSize: "7px",
                        }}
                      >
                        📍 {formData.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Gold bottom strip */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{
                background: "linear-gradient(90deg, #d4af37, #f5d066, #d4af37)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
