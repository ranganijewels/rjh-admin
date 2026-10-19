// components/common/DynamicFormFields.js
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/common/ui/form";
import { Input } from "@/components/common/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/common/ui/select";
import { Button } from "@/components/common/ui/button";
import { SquareMousePointer } from "lucide-react";

export const DynamicFormFields = ({
  questions = [],
  form,
  previewUrl,
  handleFileChange,
  fileInputRef,
}) => {
  return questions.map((q) => {
    const { answer_type, question_text, question_label, options = [] } = q;

    if (answer_type === "text") {
      return (
        <FormField
          key={q.id}
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{question_text}</FormLabel>
              <FormControl>
                <Input placeholder={question_label} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (answer_type === "dropdown") {
      return (
        <FormField
          key={q.id}
          control={form.control}
          name="landing_form_question_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{question_text}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={question_label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {options.length > 0 ? (
                        options.map((opt) => (
                          <SelectItem key={opt.id} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 dark:text-muted-foreground">
                          No options available
                        </div>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    if (answer_type === "color_picker") {
      return (
        <div key={q.id} className="flex justify-between items-center gap-5">
          <div>
            <div className="text-sm font-medium">{question_text}</div>
            <span className="text-secondary-foreground text-sm">
              {question_label}
            </span>
          </div>
          <div className="w-52 flex items-center">
            <Button variant="dim" mode="icon">
              <SquareMousePointer size={16} className="text-green-500" />
            </Button>
            <Input type="text" className="ml-2" />
          </div>
        </div>
      );
    }

    if (answer_type === "file") {
      return (
        <div key={q.id} className="flex justify-between gap-4">
          <div>
            <div className="font-medium text-sm">{question_text}</div>
            <span className="text-secondary-foreground text-sm">
              {question_label}
            </span>
          </div>
          <div className="flex gap-4">
            <div
              className="cursor-pointer p-5 border border-dashed border-input rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <span>Upload Logo</span>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                className="h-[100px] w-[100px] object-contain"
              />
            )}
          </div>
        </div>
      );
    }

    return null;
  });
};
