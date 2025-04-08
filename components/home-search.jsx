"use client"
import React from 'react'
import { Input } from './ui/input';
import { useState } from 'react'
import { Camera, Search, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { useDropzone } from 'react-dropzone';
;
const HomeSearch = () => {
    const handleTextSearch = () => {

    }
    const handleImageSearch = () => {

    }
    const [searchImage, setSearchImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isImageSearchActive, setIsImageSearchActive] = useState("");

    const onDrop = (acceptedFiles) => {
    };
    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png"],
        },
        maxFiles: 1,
    });
    return (
        <div>
            <form onSubmit={handleTextSearch}>
                <div className="relative flex items-center">
                    <Search className="absolute left-3 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Enter make, model, or use our AI Image Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm"
                    />

                    <div className="absolute right-[100px]">
                        <Camera
                            size={35}
                            onClick={() => setIsImageSearchActive(!isImageSearchActive)}
                            className="cursor-pointer rounded-xl p-1.5"
                            style={{
                                background: isImageSearchActive ? "black" : "",
                                color: isImageSearchActive ? "white" : "",
                            }}
                        />
                    </div>

                    <Button type="submit" className="absolute right-2 rounded-full">
                        Search
                    </Button>
                </div>
            </form>
            {
                isImageSearchActive && <div className='mt-4'>
                    <form onSubmit={handleImageSearch} className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center">{imagePreview ? <div></div> : (<div {...getRootProps()} className="cursor-pointer">
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center">
                                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                                {
                                    <p className="text-gray-500 mb-2">{isDragActive && !isDragReject ? "Leave the file here to upload" : "Drag 'n' drop a car image, or click to select"}</p>
                                }

                                {
                                    isDragReject && <p className='text-red-500 mb-2'>Invalid Image Type</p>
                                }
                                <p className="text-gray-400 text-sm">
                                    Supports: JPG, PNG (max 5MB)
                                </p>
                            </div>
                        </div>)}</div>
                    </form>
                </div>
            }
        </div>
    )
}

export default HomeSearch
