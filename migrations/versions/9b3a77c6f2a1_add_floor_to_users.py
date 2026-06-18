"""add floor to users

Revision ID: 9b3a77c6f2a1
Revises: d0b0ce68fe33
Create Date: 2026-06-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9b3a77c6f2a1'
down_revision = 'd0b0ce68fe33'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('floor', sa.String(length=20), nullable=True))


def downgrade():
    op.drop_column('users', 'floor')