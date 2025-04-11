"use client";

import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import CarCard from '@/components/car-card';
import { getCars } from '@/actions/car-listing';
import useFetch from '@/hooks/use-fetch';
import CarListingsLoading from './car-listing-loading';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const CarListings = () => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 6;

    // Use the useFetch hook
    const { loading, fn: fetchCars, data: result, error } = useFetch(getCars);


    // Extract filter values from searchParams
    const search = searchParams.get("search") || "";
    const make = searchParams.get("make") || "";
    const bodyType = searchParams.get("bodyType") || "";
    const fuelType = searchParams.get("fuelType") || "";
    const transmission = searchParams.get("transmission") || "";
    const minPrice = searchParams.get("minPrice") || 0;
    const maxPrice = searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER;
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1");


    // Fetch cars when filters change
    useEffect(() => {
        fetchCars({
            search,
            make,
            bodyType,
            fuelType,
            transmission,
            minPrice,
            maxPrice,
            sortBy,
            page,
            limit,
        });
    }, [
        search,
        make,
        bodyType,
        fuelType,
        transmission,
        minPrice,
        maxPrice,
        sortBy,
        page,
    ]);


    // Update URL when page changes
    useEffect(() => {
        if (currentPage !== page) {
            const params = new URLSearchParams(searchParams);
            params.set("page", currentPage.toString());
            router.push(`?${params.toString()}`);
        }
    }, [currentPage, router, searchParams, page]);

    // Handle pagination clicks
    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum);
    };

    // Generate pagination URL
    const getPaginationUrl = (pageNum) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNum.toString());
        return `?${params.toString()}`;
    };
    // Show loading state
    if (loading && !result) {
        return <CarListingsLoading />;
    }

    // Handle error
    if (error || (result && !result.success)) {
        return (
            <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load cars. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    // If no results yet, return empty placeholder
    if (!result || !result.data) {
        return null;
    }

    const { data: cars, pagination } = result;
    // No results
    if (cars.length === 0) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Info className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No cars found</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                    We couldn't find any cars matching your search criteria. Try adjusting
                    your filters or search term.
                </p>
                <Button variant="outline" asChild>
                    <Link href="/cars">Clear all filters</Link>
                </Button>
            </div>
        );
    }


    return (
        <div>
            {/* Results count and current page */}
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                    Showing{" "}
                    <span className="font-medium">
                        {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span> cars
                </p>
            </div>

            {/* Car grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                    <CarCard key={car.id} car={car} />
                ))}
            </div>

            {/* shadcn Pagination */}
            {pagination.pages > 1 && (
                <Pagination className="mt-10">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href={getPaginationUrl(page - 1)}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) {
                                        handlePageChange(page - 1);
                                    }
                                }}
                                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>

                        {paginationItems}

                        <PaginationItem>
                            <PaginationNext
                                href={getPaginationUrl(page + 1)}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < pagination.pages) {
                                        handlePageChange(page + 1);
                                    }
                                }}
                                className={
                                    page >= pagination.pages
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

        </div>
    )
}

export default CarListings
