# ShadCN/UI — Komponenten-Referenz

Quelle: https://ui.shadcn.com/docs/components
Installation: `npx shadcn@latest add [komponente]`

## Layout & Struktur

| Komponente | Beschreibung | Sub-Komponenten |
|------------|-------------|-----------------|
| Accordion | Auf-/zuklappbare Sektionen | Accordion, AccordionItem, AccordionTrigger, AccordionContent |
| Aspect Ratio | Festes Seitenverhaeltnis | AspectRatio |
| Card | Container mit Header/Content/Footer | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Collapsible | Auf-/zuklappbarer Bereich | Collapsible, CollapsibleTrigger, CollapsibleContent |
| Resizable | Groessenveraenderbare Panels | ResizablePanelGroup, ResizablePanel, ResizableHandle |
| Scroll Area | Benutzerdefinierter Scrollbereich | ScrollArea, ScrollBar |
| Separator | Trennlinie | Separator |
| Sidebar | Seitennavigation-Layout | Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton |
| Tabs | Tab-basierte Navigation | Tabs, TabsList, TabsTrigger, TabsContent |

## Navigation

| Komponente | Beschreibung | Sub-Komponenten |
|------------|-------------|-----------------|
| Breadcrumb | Brotkrumen-Navigation | Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis |
| Dropdown Menu | Dropdown-Menue | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSub |
| Context Menu | Rechtsklick-Menue | ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem |
| Menubar | Horizontale Menueleiste | Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem |
| Navigation Menu | Hauptnavigation | NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink |
| Pagination | Seitennavigation | Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis |

## Formulare & Eingaben

| Komponente | Beschreibung | Sub-Komponenten |
|------------|-------------|-----------------|
| Button | Schaltflaeche | Button |
| Button Group | Gruppierte Buttons | ButtonGroup |
| Checkbox | Ankreuzfeld | Checkbox |
| Combobox | Suchbare Auswahl (Command + Popover) | (Kombination aus Command + Popover) |
| Date Picker | Datumsauswahl (Calendar + Popover) | (Kombination aus Calendar + Popover) |
| Field | Formularfeld mit Label/Beschreibung | Field |
| Input | Texteingabe | Input |
| Input Group | Gruppierte Eingaben | InputGroup |
| Input OTP | Einmalpasswort-Eingabe | InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator |
| Label | Formularbeschriftung | Label |
| Native Select | Native HTML-Select | NativeSelect |
| Radio Group | Optionsschalter-Gruppe | RadioGroup, RadioGroupItem |
| Select | Benutzerdefinierte Auswahl | Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectSeparator |
| Slider | Schieberegler | Slider |
| Switch | An/Aus-Schalter | Switch |
| Textarea | Mehrzeiliges Textfeld | Textarea |
| Toggle | Umschalt-Button | Toggle |
| Toggle Group | Gruppierte Toggles | ToggleGroup, ToggleGroupItem |

## Datenanzeige

| Komponente | Beschreibung | Sub-Komponenten |
|------------|-------------|-----------------|
| Avatar | Benutzerbild/-initiale | Avatar, AvatarImage, AvatarFallback |
| Badge | Status-/Kategorie-Label | Badge |
| Calendar | Kalenderansicht | Calendar |
| Carousel | Bilderkarussell | Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext |
| Chart | Diagramme (Recharts-basiert) | ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend |
| Data Table | Erweiterte Tabelle (TanStack Table) | (Kombination aus Table + TanStack Table) |
| Item | Listen-Element | Item |
| Table | Einfache Tabelle | Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption |
| Typography | Text-Elemente | (h1-h4, p, blockquote, list, code, lead, large, small, muted) |

## Feedback & Status

| Komponente | Beschreibung | Sub-Komponenten |
|------------|-------------|-----------------|
| Alert | Hinweisbox | Alert, AlertTitle, AlertDescription |
| Empty | Leerzustand | Empty |
| Progress | Fortschrittsbalken | Progress |
| Skeleton | Lade-Platzhalter | Skeleton |
| Sonner | Toast-Benachrichtigungen | toast() (Funktion) |
| Spinner | Lade-Animation | Spinner |
| Toast | Benachrichtigungen (aeltere API) | Toast, Toaster, useToast |

## Overlay & Dialoge

| Komponente | Beschreibung | Sub-Komponenten |
|------------|-------------|-----------------|
| Alert Dialog | Bestaetigungsdialog | AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel |
| Command | Kommandopalette/Suche | Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator |
| Dialog | Modaler Dialog | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose |
| Drawer | Schublade (von unten/seite) | Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter |
| Hover Card | Hover-Infobox | HoverCard, HoverCardTrigger, HoverCardContent |
| Popover | Klick-Infobox | Popover, PopoverTrigger, PopoverContent |
| Sheet | Seitenpanel | Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter |
| Tooltip | Hover-Hinweis | Tooltip, TooltipTrigger, TooltipContent, TooltipProvider |

## Sonstige

| Komponente | Beschreibung | Sub-Komponenten |
|------------|-------------|-----------------|
| Direction | RTL/LTR-Unterstuetzung | DirectionProvider |
| Kbd | Tastenkuerzel-Anzeige | Kbd |
