import logging
from activity.models import ActivityLog

logger = logging.getLogger(__name__)


def log_activity(actor, action, category, *, entity_type="", entity_label="", entity_id=None):
    """Record an activity event. Never raises — logging must not break the request."""
    try:
        is_user = bool(getattr(actor, "is_authenticated", False))
        label = ((getattr(actor, "fullname", "") or getattr(actor, "username", ""))
                 if is_user else "System") or "System"
        ActivityLog.objects.create(
            actor=actor if is_user else None,
            actor_label=label,
            action=action,
            category=category,
            entity_type=entity_type,
            entity_label=entity_label or "",
            entity_id=entity_id,
        )
    except Exception:  # pragma: no cover - defensive
        logger.exception("Failed to write activity log")
