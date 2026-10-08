<?php

namespace App\Controller;

use App\Entity\Favorite;
use App\Repository\FavoriteRepository;
use App\Repository\MarketplaceListingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/marketplace/favorites')]
class FavoriteController extends AbstractController
{
    public function __construct(
        private FavoriteRepository $favoriteRepo,
        private MarketplaceListingRepository $listingRepo,
        private EntityManagerInterface $em
    ) {}

    #[Route('', methods: ['GET'])]
    public function myFavorites(Request $request): JsonResponse
    {
        $userId = $request->headers->get('X-User-Id');
        if (!$userId) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $favorites = $this->favoriteRepo->findByUserId((int)$userId);
        $data = array_map(fn($f) => [
            'id'        => $f->getId(),
            'listingId' => $f->getListingId(),
            'createdAt' => $f->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $favorites);

        return $this->json(['success' => true, 'data' => $data]);
    }

    #[Route('/{listingId}', methods: ['POST'])]
    public function add(int $listingId, Request $request): JsonResponse
    {
        $userId = $request->headers->get('X-User-Id');
        if (!$userId) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $listing = $this->listingRepo->find($listingId);
        if (!$listing) {
            return $this->json(['success' => false, 'message' => 'Annonce introuvable'], 404);
        }

        $existing = $this->favoriteRepo->findOneByUserAndListing((int)$userId, $listingId);
        if ($existing) {
            return $this->json(['success' => false, 'message' => 'Déjà dans les favoris'], 400);
        }

        $favorite = new Favorite();
        $favorite->setUserId((int)$userId);
        $favorite->setListingId($listingId);

        $this->em->persist($favorite);
        $this->em->flush();

        return $this->json(['success' => true, 'message' => 'Ajouté aux favoris'], 201);
    }

    #[Route('/{listingId}', methods: ['DELETE'])]
    public function remove(int $listingId, Request $request): JsonResponse
    {
        $userId = $request->headers->get('X-User-Id');
        if (!$userId) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        $favorite = $this->favoriteRepo->findOneByUserAndListing((int)$userId, $listingId);
        if (!$favorite) {
            return $this->json(['success' => false, 'message' => 'Favori introuvable'], 404);
        }

        $this->em->remove($favorite);
        $this->em->flush();

        return $this->json(['success' => true, 'message' => 'Retiré des favoris']);
    }
}