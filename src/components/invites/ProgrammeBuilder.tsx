import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProgrammeItem, newProgramme } from "@/lib/inviteTemplates";

interface Props {
  programmes: ProgrammeItem[];
  onChange: (next: ProgrammeItem[]) => void;
}

const ProgrammeBuilder = ({ programmes, onChange }: Props) => {
  const update = (id: string, field: keyof ProgrammeItem, value: string) => {
    onChange(programmes.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };
  const remove = (id: string) => onChange(programmes.filter((p) => p.id !== id));
  const add = () => onChange([...programmes, newProgramme()]);

  return (
    <div className="space-y-3">
      {programmes.map((p, idx) => (
        <div
          key={p.id}
          className="rounded-lg border border-border bg-muted/30 p-3 sm:p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary uppercase">
              Programme {idx + 1}
            </span>
            {programmes.length > 1 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => remove(p.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div>
            <Label className="text-xs">Programme Name *</Label>
            <Input
              value={p.name}
              onChange={(e) => update(p.id, "name", e.target.value)}
              placeholder="e.g. Mehndi, Nikah, Reception"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={p.date}
                onChange={(e) => update(p.id, "date", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Time</Label>
              <Input
                type="time"
                value={p.time}
                onChange={(e) => update(p.id, "time", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Venue</Label>
            <Input
              value={p.venue}
              onChange={(e) => update(p.id, "venue", e.target.value)}
              placeholder="Full venue address"
            />
          </div>
          <div>
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              value={p.notes || ""}
              onChange={(e) => update(p.id, "notes", e.target.value)}
              placeholder="Dress code, special instructions, etc."
              rows={2}
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Programme
      </Button>
    </div>
  );
};

export default ProgrammeBuilder;