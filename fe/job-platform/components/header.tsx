import { LayoutDashboard, Bell, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { AvatarImage, AvatarFallback, Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenu,
} from "./ui/dropdown-menu";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              AI Job Search Copilot
            </p>
            <p className="truncate text-xs text-slate-500">
              {session?.user?.role ?? "seeker"} workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/identicon/png?seed=${session?.user?.username ?? "default"}`}
                    alt="shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32">
              <DropdownMenuGroup>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
