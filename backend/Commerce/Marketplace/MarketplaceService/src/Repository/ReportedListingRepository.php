<?php

namespace App\Repository;

use App\Entity\ReportedListing;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ReportedListingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ReportedListing::class);
    }

    public function findByListingId(int $listingId): array
    {
        return $this->findBy(['listingId' => $listingId]);
    }
}