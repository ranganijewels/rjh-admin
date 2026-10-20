// Broadcast when an admin request comes back 401.
//
// Kept in its own module so the client shell and the request helpers can
// agree on the event name without either of them importing the other.
export const SESSION_EXPIRED_EVENT = "rjh:session-expired";
