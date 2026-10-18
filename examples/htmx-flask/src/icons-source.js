/**
 * Icons for this app. `npm run build:icons` bundles only these into
 * static/js/icons.js, which base.html loads right after tyrell.js.
 *
 * Register through window.tyIcons (the components come from the CDN script);
 * importing `registerIcons` would create a second registry <ty-icon> never reads.
 */
import {
  activity, alertCircle, alertTriangle, appWindow, arrowLeft, arrowRight,
  bell, bookOpen, calendar, calendarCheck, calendarDays, calendarPlus,
  calendarX, check, checkCircle, chevronDown, chevronLeft, chevronRight,
  chevronUp, circle, clipboard, clock, cloud, code, copy, database, download,
  edit, eye, eyeOff, file, flag, folder, gift, github, hash, heart, home, info,
  keyIcon, layers, layoutGrid, linkIcon, listIcon, loader, loaderCircle, lock,
  mail, menuIcon, messageCircle, minus, moon, moreHorizontal, moreVertical,
  mousePointer, pause, phone, play, plus, refreshCw, save, searchIcon, searchX,
  sendIcon, server, settings, share2, sparkles, square, star, sun, tag, target,
  terminal, thumbsUp, trash2, triangle, upload, user, userCheck, users, wifiOff,
  x, xCircle, zap, zapOff,
} from 'tyrell-components/icons/lucide'

await customElements.whenDefined('ty-icon')

window.tyIcons.register({
  activity, 'alert-circle': alertCircle, 'alert-triangle': alertTriangle,
  'arrow-left': arrowLeft, 'arrow-right': arrowRight, bell, 'book-open': bookOpen,
  calendar, 'calendar-check': calendarCheck, 'calendar-days': calendarDays,
  'calendar-plus': calendarPlus, 'calendar-x': calendarX, check,
  'check-circle': checkCircle, 'chevron-down': chevronDown,
  'chevron-left': chevronLeft, 'chevron-right': chevronRight,
  'chevron-up': chevronUp, circle, clipboard, clock, cloud, code, copy, database,
  download, edit, eye, 'eye-off': eyeOff, file, flag, folder, gift, github, hash,
  heart, home, info, key: keyIcon, layers, 'layout-grid': layoutGrid,
  link: linkIcon, list: listIcon, loader, 'loader-2': loaderCircle, lock, mail,
  menu: menuIcon, 'message-circle': messageCircle, minus, moon,
  'more-horizontal': moreHorizontal, 'more-vertical': moreVertical,
  'mouse-pointer': mousePointer, pause, phone, play, plus,
  'refresh-cw': refreshCw, save, search: searchIcon, 'search-x': searchX,
  send: sendIcon, server, settings, share: share2, sparkles, stop: square,
  square, star, sun, tag, target, terminal, 'thumbs-up': thumbsUp,
  trash: trash2, triangle, upload, user, 'user-check': userCheck, users,
  'wifi-off': wifiOff, window: appWindow, x, 'x-circle': xCircle, zap,
  'zap-off': zapOff,
})
