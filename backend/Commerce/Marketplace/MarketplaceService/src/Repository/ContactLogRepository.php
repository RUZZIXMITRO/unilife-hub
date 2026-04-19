<?php

namespace App\Repository;

use App\Entity\ContactLog;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ContactLogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContactLog::class);
    }

    public function findByListingId(int $listingId): array
    {
        return $this->findBy(['listingId' => $listingId]);
    }

    public function findByBuyerId(int $buyerId): array
    {
        return $this->findBy(['buyerId' => $buyerId]);
    }
}