<?php

namespace App\Repository;

use App\Entity\MarketplaceListing;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class MarketplaceListingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MarketplaceListing::class);
    }

    public function findByStatus(string $status): array
    {
        return $this->findBy(['status' => $status]);
    }

    public function findBySellerId(int $sellerId): array
    {
        return $this->findBy(['sellerId' => $sellerId]);
    }

    public function findByCategory(string $category): array
    {
        return $this->findBy(['category' => $category, 'status' => 'approved']);
    }

    public function search(string $query): array
    {
        return $this->createQueryBuilder('l')
            ->where('l.title LIKE :query OR l.description LIKE :query')
            ->andWhere('l.status = :status')
            ->setParameter('query', '%' . $query . '%')
            ->setParameter('status', 'approved')
            ->getQuery()
            ->getResult();
    }

    public function findApproved(): array
    {
        return $this->findBy(['status' => 'approved']);
    }
}