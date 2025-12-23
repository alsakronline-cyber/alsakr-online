from sqlalchemy.orm import Session
from app.models.vendor import Vendor

class VendorService:
    @staticmethod
    def automatch_vendors(db: Session, category: str = None) -> list[Vendor]:
        """
        Selects vendors based on criteria.
        For now, returns all vendors with reliability_score > 3.0.
        """
        # In a real app, we would filter by category as well.
        # matched_vendors = db.query(Vendor).filter(Vendor.categories.contains(category), Vendor.reliability_score > 3.0).all()
        
        matched_vendors = db.query(Vendor).filter(Vendor.reliability_score > 3.0).all()
        return matched_vendors
