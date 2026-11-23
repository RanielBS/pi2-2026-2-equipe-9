
from django.db import models

from users.models.user_model import User
from analysis.models.search_request_model import SearchRequest


class TechnicalReview(models.Model):
    search_request = models.OneToOneField(
        SearchRequest,
        on_delete=models.CASCADE,
        related_name="technical_review"
    )

    technician = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="technical_reviews"
    )

    final_species = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    technical_opinion = models.TextField()

    was_corrected = models.BooleanField(default=False)

    reviewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "TechnicalReviews"
        ordering = ["-reviewed_at"]

    def __str__(self):
        return f"Revisão da análise {self.search_request_id}"
