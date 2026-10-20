"use client";
import { useDispatch } from "react-redux";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/common/ui/form";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/common/ui/input";
import { Button } from "@/components/common/ui/button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/common/ui/checkbox";
import { toast } from "sonner";
import { loginUser } from "@/store/authThunks";

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState(null);

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await dispatch(
        loginUser({
          email: values.email,
          password: values.password,
          remember: values.rememberMe,
        })
      ).unwrap();

      router.push("/");
    } catch (err) {
      toast.error(err?.message || String(err) || "Login failed");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="block w-full space-y-5"
      >
        {error && (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@ranganijewelry.com"
                  aria-invalid={!!fieldState.error}
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2.5">
                <FormLabel className="text-muted-foreground">Password</FormLabel>
                <button
                  type="button"
                  onClick={() => router.push("/reset-password")}
                  className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  placeholder="••••••••"
                  autoComplete="current-password"
                  type={passwordVisible ? "text" : "password"}
                  aria-invalid={!!fieldState.error}
                  className="h-11 pr-10"
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                >
                  {passwordVisible ? (
                    <EyeOff className="text-muted-foreground" />
                  ) : (
                    <Eye className="text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(!!checked)}
              />
              <label
                htmlFor="remember-me"
                className="cursor-pointer text-sm leading-none text-muted-foreground"
              >
                Remember me
              </label>
            </div>
          )}
        />

        <Button type="submit" size="lg" className="w-full">
          Sign in
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
