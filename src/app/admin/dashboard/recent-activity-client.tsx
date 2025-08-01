
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/star-rating";
import type { Review } from "@/lib/types";

interface RecentActivityClientProps {
    reviews: (Review & { teacherName: string, subjectName: string })[];
}

export default function RecentActivityClient({ reviews }: RecentActivityClientProps) {

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                    As últimas 10 avaliações adicionadas ao site.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Professor</TableHead>
                                <TableHead>Matéria</TableHead>
                                <TableHead className="w-[40%]">Avaliação</TableHead>
                                <TableHead>Nota</TableHead>
                                <TableHead>Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell className="font-medium">{review.teacherName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{review.subjectName}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{review.text}</TableCell>
                                    <TableCell>
                                        <StarRating rating={review.rating} />
                                    </TableCell>
                                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
