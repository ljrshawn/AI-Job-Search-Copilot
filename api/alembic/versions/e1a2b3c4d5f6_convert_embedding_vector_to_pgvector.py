"""convert embedding_vector columns to pgvector

Revision ID: e1a2b3c4d5f6
Revises: c4b8f7a1d2e3
Create Date: 2026-04-29 21:10:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e1a2b3c4d5f6"
down_revision: Union[str, Sequence[str], None] = "c4b8f7a1d2e3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.execute(
        "ALTER TABLE jobs "
        "ALTER COLUMN embedding_vector TYPE vector "
        "USING embedding_vector::vector"
    )
    op.execute(
        "ALTER TABLE resumes "
        "ALTER COLUMN embedding_vector TYPE vector "
        "USING embedding_vector::vector"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(
        "ALTER TABLE jobs "
        "ALTER COLUMN embedding_vector TYPE double precision[] "
        "USING vector_to_array(embedding_vector)"
    )
    op.execute(
        "ALTER TABLE resumes "
        "ALTER COLUMN embedding_vector TYPE double precision[] "
        "USING vector_to_array(embedding_vector)"
    )

