/**
 * SF Symbols for the iOS target.
 *
 * An icon written as "sf:<name>" is an SF Symbol. The iOS prompt hands the name to the code
 * model as it is; the Android and web prompts turn it back into a Material name. SF Symbols
 * may only be shown on Apple platforms, so the web canvas never draws them: every name has a
 * Material Symbols stand-in that the canvas draws instead.
 */

export const SF_PREFIX = "sf:";
export const isSf = (icon: string | null | undefined): icon is string => !!icon && icon.startsWith(SF_PREFIX);
export const sfName = (icon: string) => icon.slice(SF_PREFIX.length);

export type SfSymbol = { name: string; material: string; tags: string };

/* name | Material stand-in | words to search by */
const RAW = `
house|home|home start main
house.fill|home|home start main
magnifyingglass|search|search find
gearshape|settings|settings preferences
gearshape.fill|settings|settings preferences
gear|settings|settings preferences
ellipsis|more_horiz|more options
ellipsis.circle|more_horiz|more options
line.3.horizontal|menu|menu hamburger
line.3.horizontal.decrease|filter_list|filter sort
line.3.horizontal.decrease.circle|filter_list|filter sort
slider.horizontal.3|tune|adjust settings filter
plus|add|add new create
plus.circle|add_circle|add new create
plus.circle.fill|add_circle|add new create
minus|remove|remove subtract
minus.circle|do_not_disturb_on|remove subtract
xmark|close|close dismiss cancel
xmark.circle|cancel|close dismiss cancel
xmark.circle.fill|cancel|close dismiss cancel
checkmark|check|done check confirm
checkmark.circle|check_circle|done check confirm
checkmark.circle.fill|check_circle|done check confirm
circle|radio_button_unchecked|circle empty
chevron.left|chevron_left|back left
chevron.right|chevron_right|next right disclosure
chevron.up|expand_less|up collapse
chevron.down|expand_more|down expand
chevron.backward|arrow_back_ios_new|back
chevron.forward|arrow_forward_ios|forward next
arrow.left|arrow_back|back left
arrow.right|arrow_forward|forward right
arrow.up|arrow_upward|up
arrow.down|arrow_downward|down
arrow.up.arrow.down|swap_vert|sort order
arrow.left.arrow.right|swap_horiz|swap exchange
arrow.clockwise|refresh|refresh reload
arrow.counterclockwise|history|history undo back
arrow.triangle.2.circlepath|sync|sync repeat
arrow.uturn.backward|undo|undo
arrow.uturn.forward|redo|redo
arrow.up.right.square|open_in_new|open external link
arrow.up.left.and.arrow.down.right|open_in_full|expand fullscreen
arrow.down.right.and.arrow.up.left|close_fullscreen|collapse shrink
square.and.arrow.up|ios_share|share export
square.and.arrow.down|download|save download
square.and.pencil|edit_square|compose write new
pencil|edit|edit write
trash|delete|delete remove bin
trash.fill|delete|delete remove bin
doc.on.doc|content_copy|copy duplicate
link|link|link url
paperclip|attach_file|attach attachment
square.grid.2x2|grid_view|grid apps
list.bullet|list|list
list.number|format_list_numbered|list numbered
list.dash|list|list
sidebar.left|view_sidebar|sidebar
rectangle.3.group|dashboard|dashboard widgets
square.split.2x1|vertical_split|split columns
square.stack.3d.up|layers|layers stack
tablecells|table|table grid
bookmark|bookmark|bookmark save
bookmark.fill|bookmark|bookmark save
tag|sell|tag label
tag.fill|sell|tag label
flag|flag|flag report
flag.fill|flag|flag report
pin|push_pin|pin
pin.fill|push_pin|pin
star|star|star favorite rating
star.fill|star|star favorite rating
heart|favorite|heart like love favorite
heart.fill|favorite|heart like love favorite
hand.thumbsup|thumb_up|like thumbs up
hand.thumbsdown|thumb_down|dislike thumbs down
eye|visibility|show visible view
eye.slash|visibility_off|hide hidden
lock|lock|lock secure private
lock.fill|lock|lock secure private
lock.open|lock_open|unlock open
key|key|key password
shield|shield|shield security
info.circle|info|info about
questionmark.circle|help|help question
exclamationmark.triangle|warning|warning alert
exclamationmark.circle|error|error alert
nosign|block|block forbidden
bell|notifications|bell notifications alerts
bell.fill|notifications|bell notifications alerts
bell.slash|notifications_off|mute notifications off
message|chat|message chat sms
message.fill|chat|message chat sms
bubble.left|chat_bubble|chat comment
bubble.left.and.bubble.right|forum|chat conversation
phone|call|phone call
phone.fill|call|phone call
video|videocam|video call camera
video.fill|videocam|video call camera
envelope|mail|mail email
envelope.fill|mail|mail email
envelope.open|drafts|mail read
paperplane|send|send
paperplane.fill|send|send
at|alternate_email|at email mention
mic|mic|microphone voice
mic.fill|mic|microphone voice
mic.slash|mic_off|mute microphone
person|person|person profile account user
person.fill|person|person profile account user
person.circle|account_circle|profile account avatar
person.crop.circle|account_circle|profile account avatar
person.2|group|people group friends
person.2.fill|group|people group friends
person.3|groups|people team community
person.badge.plus|person_add|add friend invite
person.crop.circle.badge.checkmark|how_to_reg|verified member
photo|image|photo image picture
photo.fill|image|photo image picture
photo.on.rectangle|photo_library|photos gallery album
photo.badge.plus|add_photo_alternate|add photo
camera|photo_camera|camera photo
camera.fill|photo_camera|camera photo
play|play_arrow|play
play.fill|play_arrow|play
pause|pause|pause
pause.fill|pause|pause
stop.fill|stop|stop
forward.fill|fast_forward|forward skip
backward.fill|fast_rewind|back rewind
shuffle|shuffle|shuffle random
repeat|repeat|repeat loop
music.note|music_note|music song
music.note.list|queue_music|playlist music
speaker.wave.2|volume_up|volume sound
speaker.slash|volume_off|mute sound
headphones|headphones|headphones audio
waveform|graphic_eq|audio waveform voice
film|movie|film movie video
tv|tv|tv television
airplayvideo|cast|airplay cast
doc|description|document file
doc.text|description|document file text
doc.richtext|article|article document
note.text|notes|note text
folder|folder|folder files
folder.fill|folder|folder files
tray|inbox|inbox tray
tray.full|inbox|inbox tray
archivebox|archive|archive box
books.vertical|library_books|library books
book|menu_book|book read
newspaper|newspaper|news article
calendar|calendar_month|calendar date event
calendar.badge.plus|calendar_add_on|add event
clock|schedule|clock time
clock.fill|schedule|clock time
alarm|alarm|alarm
timer|timer|timer countdown
stopwatch|timer|stopwatch
hourglass|hourglass_empty|wait pending
clock.arrow.circlepath|history|history recent
cart|shopping_cart|cart shop buy
cart.fill|shopping_cart|cart shop buy
bag|shopping_bag|bag shop
basket|shopping_basket|basket shop
creditcard|credit_card|card payment
dollarsign.circle|paid|money price
banknote|payments|money cash
giftcard|card_giftcard|gift card
gift|redeem|gift present
storefront|storefront|store shop
shippingbox|package_2|package box delivery
truck.box|local_shipping|delivery shipping
chart.bar|bar_chart|chart bar statistics
chart.pie|pie_chart|chart pie
chart.line.uptrend.xyaxis|trending_up|chart trend growth
chart.xyaxis.line|show_chart|chart line
map|map|map
mappin|place|pin place location
mappin.and.ellipse|location_on|location place
location|near_me|location navigation
location.fill|near_me|location navigation
globe|public|globe web world language
airplane|flight|flight travel
car|directions_car|car drive
car.fill|directions_car|car drive
bus|directions_bus|bus transit
tram|tram|tram train transit
bicycle|directions_bike|bike cycling
figure.walk|directions_walk|walk
figure.run|directions_run|run fitness
fork.knife|restaurant|food restaurant eat
cup.and.saucer|local_cafe|coffee cafe
bed.double|bed|bed hotel sleep
building.2|apartment|building city
building.columns|account_balance|bank museum
leaf|eco|leaf nature eco
sun.max|light_mode|sun light weather
moon|dark_mode|moon dark night
moon.fill|dark_mode|moon dark night
cloud|cloud|cloud weather
cloud.rain|rainy|rain weather
snowflake|ac_unit|snow cold
bolt|bolt|bolt energy flash
bolt.fill|bolt|bolt energy flash
flame|local_fire_department|fire hot
drop|water_drop|water drop
thermometer.medium|thermostat|temperature
umbrella|umbrella|umbrella rain
heart.text.square|monitor_heart|health heart
dumbbell|fitness_center|fitness gym
pills|medication|medicine pills
cross.case|medical_services|medical first aid
stethoscope|stethoscope|doctor health
iphone|smartphone|phone device
ipad|tablet|tablet device
laptopcomputer|laptop|laptop computer
desktopcomputer|desktop_windows|desktop computer
applewatch|watch|watch
keyboard|keyboard|keyboard
printer|print|print printer
wifi|wifi|wifi network
antenna.radiowaves.left.and.right|sensors|signal broadcast
battery.100|battery_full|battery
battery.25|battery_2_bar|battery low
qrcode|qr_code|qr code scan
barcode|barcode|barcode scan
icloud|cloud|icloud cloud sync
icloud.slash|cloud_off|offline cloud
externaldrive|hard_drive|drive storage
power|power_settings_new|power
lightbulb|lightbulb|idea light
gamecontroller|sports_esports|game controller
textformat|text_fields|text format
bold|format_bold|bold
italic|format_italic|italic
underline|format_underlined|underline
strikethrough|strikethrough_s|strikethrough
text.alignleft|format_align_left|align left
text.aligncenter|format_align_center|align center
quote.bubble|format_quote|quote
translate|translate|translate language
sparkles|auto_awesome|sparkles magic ai
wand.and.stars|auto_fix_high|magic wand
paintbrush|brush|paint brush
paintpalette|palette|palette color theme
scissors|content_cut|cut scissors
hammer|build|build tool
wrench.and.screwdriver|handyman|tools repair
puzzlepiece|extension|extension plugin
graduationcap|school|school education
briefcase|work|work job
face.smiling|mood|smile happy
hand.raised|back_hand|hand stop
hand.wave|waving_hand|wave hello
party.popper|celebration|party celebration
trophy|emoji_events|trophy award
medal|military_tech|medal award
pawprint|pets|pet animal
rectangle.portrait.and.arrow.right|logout|logout sign out
`;

export const SF_SYMBOLS: SfSymbol[] = RAW.trim()
  .split("\n")
  .map((line) => {
    const [name, material, tags = ""] = line.split("|");
    return { name, material, tags };
  });

const STAND_IN = new Map(SF_SYMBOLS.map((s) => [s.name, s.material]));

/** what the canvas draws for an icon: a Material name as it is, an SF name through its stand-in */
export function glyphOf(icon: string): { glyph: string; fill: boolean } {
  if (!isSf(icon)) return { glyph: icon, fill: false };
  const name = sfName(icon);
  return { glyph: STAND_IN.get(name) ?? STAND_IN.get(name.replace(/\.fill$/, "")) ?? "category", fill: name.endsWith(".fill") };
}

/** the Material name an Android or web prompt uses for an icon */
export const materialOf = (icon: string) => glyphOf(icon).glyph;

/* an SF name in running text may be followed by a sentence's full stop */
const SF_IN_TEXT = /sf:([a-z0-9.]+)/g;
const split = (n: string) => {
  const name = n.replace(/\.+$/, "");
  return { name, rest: n.slice(name.length) };
};

/** iOS prompt text: "sf:magnifyingglass" becomes "magnifyingglass" */
export const sfToNames = (text: string) => text.replace(SF_IN_TEXT, (_, n: string) => n);

/** Android and web prompt text: "sf:magnifyingglass" becomes its Material stand-in, "search" */
export const sfToMaterial = (text: string) =>
  text.replace(SF_IN_TEXT, (_, n: string) => {
    const { name, rest } = split(n);
    return materialOf(SF_PREFIX + name) + rest;
  });

/** SF Symbols whose name or meaning matches the query, in catalog order */
export function searchSf(q: string, limit = 240): SfSymbol[] {
  const s = q.trim().toLowerCase();
  if (!s) return SF_SYMBOLS.slice(0, limit);
  return SF_SYMBOLS.filter((x) => x.name.includes(s) || x.tags.includes(s) || x.material.includes(s)).slice(0, limit);
}

/** a name the person typed that could be an SF Symbol not in the catalog */
export const looksLikeSfName = (q: string) => /^[a-z0-9]+(\.[a-z0-9]+)*$/.test(q.trim());
