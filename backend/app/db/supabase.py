"""
Supabase Client Initialization
Provides async Supabase client for database operations
"""

from supabase import create_client, Client
from app.core.config import settings


def get_supabase_client() -> Client:
    """
    Initialize and return Supabase client with service role key
    This client has elevated privileges for backend operations
    
    Returns:
        Supabase Client instance
    """
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
    )


def get_supabase_anon_client() -> Client:
    """
    Initialize and return Supabase client with anon key
    This client respects Row Level Security policies
    
    Returns:
        Supabase Client instance
    """
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_ANON_KEY
    )


# Global client instances
supabase_client = get_supabase_client()
supabase_anon = get_supabase_anon_client()
