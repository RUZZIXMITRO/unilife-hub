<?php

namespace App\Repository;

use App\Entity\Favorite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class FavoriteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Favorite::class);
    }

    public function findByUserId(int $userId): array
    {
        return $this->findBy(['userId' => $userId]);
    }

    public function findOneByUserAndListing(int $userId, int $listingId): ?Favorite
    {
        return $this->findOneBy(['userId' => $userId, 'listingId' => $listingId]);
    }
}