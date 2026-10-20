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
        <div className="space-y-1.5 pb-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        </div>

        {error && (
          <p role="alert" aria-live="polite" className="text-destructive text-sm">
            {error}
          </p>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your email"
                  aria-invalid={!!fieldState.error}
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
              <div className="flex justify-between items-center gap-2.5">
                <FormLabel>Password</FormLabel>
                <button
                  type="button"
                  onClick={() => router.push("/reset-password")}
                  className="text-sm font-semibold text-foreground hover:text-primary cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  placeholder="Your password"
                  autoComplete="current-password"
                  type={passwordVisible ? "text" : "password"}
                  aria-invalid={!!fieldState.error}
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
                className="text-sm leading-none text-muted-foreground"
              >
                Remember me
              </label>
            </div>
          )}
        />

        <div className="flex flex-col gap-2.5">
          <Button type="submit">Sign In</Button>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
