<?php
namespace App\Controller;
use App\Entity\ReportedListing;
use App\Repository\MarketplaceListingRepository;
use App\Repository\ReportedListingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/marketplace')]
class ReportController extends AbstractController
{
    public function __construct(
        private MarketplaceListingRepository $listingRepo,
        private EntityManagerInterface $em,
        private ReportedListingRepository $reportRepo
    ) {}

    #[Route('/report/{listingId}', methods: ['POST'])]
    public function report(int $listingId, Request $request): JsonResponse
    {
        $reporterId = $request->headers->get('X-User-Id');
        if (!$reporterId) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        $listing = $this->listingRepo->find($listingId);
        if (!$listing) {
            return $this->json(['success' => false, 'message' => 'Annonce introuvable'], 404);
        }
        $data = json_decode($request->getContent(), true);
        $report = new ReportedListing();
        $report->setListingId($listingId);
        $report->setReporterId((int)$reporterId);
        $report->setReason($data['reason'] ?? 'Non spécifiée');
        $this->em->persist($report);
        $this->em->flush();
        return $this->json(['success' => true, 'message' => 'Annonce signalée'], 201);
    }

    #[Route('/admin/reports', methods: ['GET'])]
    public function adminGetReports(Request $request): JsonResponse
    {
        $role = $request->headers->get('X-User-Role');
        if ($role !== 'ADMIN') {
            return $this->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }
        $reports = $this->reportRepo->findAll();
        $data = array_map(function($r) {
            $listing = $this->listingRepo->find($r->getListingId());
            return [
                'id'        => $r->getId(),
                'listingId' => $r->getListingId(),
                'reporterId'=> $r->getReporterId(),
                'reason'    => $r->getReason(),
                'createdAt' => $r->getCreatedAt()->format('Y-m-d H:i:s'),
                'listing'   => $listing ? [
                    'id'       => $listing->getId(),
                    'title'    => $listing->getTitle(),
                    'status'   => $listing->getStatus(),
                    'sellerId' => $listing->getSellerId(),
                    'imageUrls'=> $listing->getImageUrls(),
                ] : null
            ];
        }, $reports);
        return $this->json(['success' => true, 'data' => $data]);
    }

    #[Route('/admin/reports/{id}', methods: ['DELETE'])]
    public function adminDeleteReport(int $id, Request $request): JsonResponse
    {
        $role = $request->headers->get('X-User-Role');
        if ($role !== 'ADMIN') {
            return $this->json(['success' => false, 'message' => 'Non autorisé'], 403);
        }
        $report = $this->reportRepo->find($id);
        if (!$report) {
            return $this->json(['success' => false, 'message' => 'Signalement introuvable'], 404);
        }
        $this->em->remove($report);
        $this->em->flush();
        return $this->json(['success' => true, 'message' => 'Signalement supprimé']);
    }
}