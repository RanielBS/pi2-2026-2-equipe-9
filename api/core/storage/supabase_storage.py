
import mimetypes
import os

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.files.base import ContentFile
from django.core.files.storage import Storage

from supabase import create_client


class SupabaseStorage(Storage):

    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.rstrip("/")
        self.supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY
        self.bucket_name = settings.SUPABASE_STORAGE_BUCKET

        if not self.supabase_url or not self.supabase_key:
            raise ImproperlyConfigured(
                "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
            )

        self.client = create_client(
            self.supabase_url,
            self.supabase_key
        )

    def _save(self, name, content):
        name = name.replace("\\", "/").lstrip("/")

        content.seek(0)
        file_content = content.read()

        content_type, _ = mimetypes.guess_type(name)

        self.client.storage.from_(self.bucket_name).upload(
            path=name,
            file=file_content,
            file_options={
                "content-type": content_type or "application/octet-stream",
                "upsert": "false"
            }
        )

        return name

    def _open(self, name, mode="rb"):
        response = self.client.storage.from_(
            self.bucket_name
        ).download(name)

        return ContentFile(
            response,
            name=os.path.basename(name)
        )

    def exists(self, name):
        name = name.replace("\\", "/").lstrip("/")

        directory = os.path.dirname(name)
        filename = os.path.basename(name)

        files = self.client.storage.from_(
            self.bucket_name
        ).list(directory)

        for item in files:
            item_name = (
                item.get("name")
                if isinstance(item, dict)
                else getattr(item, "name", None)
            )

            if item_name == filename:
                return True

        return False

    def delete(self, name):
        self.client.storage.from_(
            self.bucket_name
        ).remove([name])

    def url(self, name):
        response = self.client.storage.from_(
            self.bucket_name
        ).create_signed_url(
            name,
            settings.SUPABASE_SIGNED_URL_EXPIRES_IN
        )

        if hasattr(response, "data"):
            response = response.data

        if isinstance(response, dict):
            signed_url = (
                response.get("signedURL")
                or response.get("signedUrl")
                or response.get("signed_url")
            )
        else:
            signed_url = getattr(response, "signedURL", None)

        if not signed_url:
            raise ValueError(
                "O Supabase não retornou a URL assinada da imagem."
            )

        if signed_url.startswith("http"):
            return signed_url

        if signed_url.startswith("/storage/v1/"):
            return f"{self.supabase_url}{signed_url}"

        if signed_url.startswith("/"):
            return f"{self.supabase_url}/storage/v1{signed_url}"

        return f"{self.supabase_url}/storage/v1/{signed_url}"
