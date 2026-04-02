import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="type-h2">Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="type-small text-muted-foreground">
          Login form placeholder.
        </p>
      </CardContent>
    </Card>
  );
}
