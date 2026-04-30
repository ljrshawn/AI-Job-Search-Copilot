"""enable vector extension

Revision ID: c4b8f7a1d2e3
Revises: 3008d9e565df
Create Date: 2026-04-29 20:45:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c4b8f7a1d2e3"
down_revision: Union[str, Sequence[str], None] = "3008d9e565df"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")


def downgrade() -> None:
    """Downgrade schema."""
    # Keep extension in place to avoid dropping objects that may depend on it.
    pass

