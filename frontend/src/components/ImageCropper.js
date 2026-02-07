import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";
import { X, Check, ZoomIn, ZoomOut } from "lucide-react";

const ImageCropper = ({ image, aspect = 1, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImageBlob = await getCroppedImg(
                image,
                croppedAreaPixels
            );
            onCropComplete(croppedImageBlob);
        } catch (e) {
            console.error(e);
        }
    }, [croppedAreaPixels, image, onCropComplete]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 10000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ position: 'relative', width: '90%', height: '70%', background: '#333', borderRadius: '10px', overflow: 'hidden' }}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteInternal}
                    onZoomChange={onZoomChange}
                    showGrid={true}
                />
            </div>

            <div style={{ width: '90%', maxWidth: '400px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ZoomOut size={20} color="white" />
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(e.target.value)}
                    style={{ flex: 1 }}
                />
                <ZoomIn size={20} color="white" />
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '10px 30px', background: 'transparent',
                        border: '2px solid white', color: 'white', borderRadius: '30px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        fontWeight: 'bold'
                    }}
                >
                    <X size={20} /> Cancel
                </button>
                <button
                    onClick={showCroppedImage}
                    style={{
                        padding: '10px 30px', background: '#2196f3',
                        border: 'none', color: 'white', borderRadius: '30px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        fontWeight: 'bold', boxShadow: '0 4px 10px rgba(33, 150, 243, 0.4)'
                    }}
                >
                    <Check size={20} /> Done
                </button>
            </div>
        </div>
    );
};

export default ImageCropper;
