import React, { useState, useRef } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { isHRRole } from '../../permissions';

export const GalleryView: React.FC<ModuleViewsProps> = (props) => {
  const { selectedCompany, selectedUser, companyImages, onUploadCompanyImage, onDeleteCompanyImage } = props;

  const localImages = companyImages.filter(i => i.companyId === selectedCompany.id);
  const canManage = isHRRole(selectedUser.activeRole);

  const [showUpload, setShowUpload] = useState(false);
  const [viewImage, setViewImage] = useState<any>(null);
  const [viewImageData, setViewImageData] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const fileRef = useRef<HTMLInputElement>(null);

  // Upload form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Company Events');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const categories = ['All', ...Array.from(new Set(localImages.map(i => i.category)))];
  const filtered = filterCat === 'All' ? localImages : localImages.filter(i => i.category === filterCat);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!preview || !title.trim()) return;
    setUploading(true);
    onUploadCompanyImage({
      companyId: selectedCompany.id,
      title: title.trim(),
      description: description.trim(),
      category,
      imageData: preview,
      uploadedBy: selectedUser.id,
      uploadedByName: selectedUser.name,
    });
    setTitle('');
    setDescription('');
    setPreview('');
    setUploading(false);
    setShowUpload(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Image Gallery"
        subtitle={`${selectedCompany.name} · ${localImages.length} images`}
        action={canManage ? <PrimaryBtn icon="bi bi-upload" onClick={() => setShowUpload(!showUpload)}>{showUpload ? 'Close' : 'Upload Image'}</PrimaryBtn> : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Images" value={`${localImages.length}`} icon="bi bi-images" accent />
        <StatCard label="Categories" value={`${categories.length - 1}`} sub="Distinct categories" icon="bi bi-tags" color="text-violet-600" />
        <StatCard label="Uploaded by HR" value={`${localImages.filter(i => i.uploadedBy === selectedUser.id).length}`} sub="Your uploads" icon="bi bi-person-check" color="text-emerald-600" />
      </div>

      {/* Upload Form */}
      {showUpload && canManage && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 max-w-2xl">
          <h3 className="section-title text-slate-500 mb-5">Upload Company Image</h3>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Team Building July 2026" />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief description..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <input
                  list="gallery-cat-list"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Type or select..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                />
                <datalist id="gallery-cat-list">
                  <option>Company Events</option>
                  <option>Office Life</option>
                  <option>Team Building</option>
                  <option>Products</option>
                  <option>Awards</option>
                  <option>Social Responsibility</option>
                </datalist>
              </div>
              <div>
                <Label>Image (max 5 MB)</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="w-full fs-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white file:fs-xs file:fw-semibold file:cursor-pointer"
                />
              </div>
            </div>
            {preview && (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-lg border border-slate-200" />
                <button onClick={() => setPreview('')} className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1.5 text-slate-500 hover:text-red-500 cursor-pointer">
                  <i className="bi bi-x-lg fs-xs"></i>
                </button>
              </div>
            )}
            <PrimaryBtn icon="bi bi-upload" onClick={handleUpload} disabled={!preview || !title.trim() || uploading}>
              {uploading ? 'Uploading...' : 'Upload to Gallery'}
            </PrimaryBtn>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {localImages.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-full fs-xs fw-semibold transition-all cursor-pointer ${
                filterCat === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 fs-sm">
          <i className="bi bi-images fs-3xl mb-3 block"></i>
          {localImages.length === 0 ? 'No images yet. Upload the first one!' : 'No images in this category.'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(img => (
            <div key={img.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group">
              <div className="relative aspect-video bg-slate-100 cursor-pointer" onClick={async () => {
                setViewImage(img);
                setLoadingImage(true);
                try {
                  const res = await fetch(`/api/company-images/${img.id}`);
                  const full = await res.json();
                  setViewImageData(full.imageData || '');
                } catch { setViewImageData(''); }
                setLoadingImage(false);
              }}>
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  <i className="bi bi-image fs-2xl"></i>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="fs-xs fw-bold text-slate-900 truncate">{img.title}</h4>
                    {img.description && <p className="fs-[10px] text-slate-500 truncate mt-0.5">{img.description}</p>}
                  </div>
                  <Badge label={img.category} variant="info" />
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">{img.uploadedByName} · {new Date(img.createdAt).toLocaleDateString()}</span>
                  {canManage && (
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm('Delete this image?')) onDeleteCompanyImage(img.id); }}
                      className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                    >
                      <i className="bi bi-trash fs-xs"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {viewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setViewImage(null); setViewImageData(''); }}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div>
                <h3 className="fs-sm fw-bold text-slate-900">{viewImage.title}</h3>
                <p className="text-[11px] text-slate-500">{viewImage.uploadedByName} · {new Date(viewImage.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setViewImage(null)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-4">
              <div className="bg-slate-100 rounded-lg flex items-center justify-center min-h-[300px] overflow-hidden">
                {loadingImage ? (
                  <div className="text-center text-slate-400">
                    <i className="bi bi-arrow-repeat fs-2xl mb-2 block animate-spin"></i>
                    <p className="fs-xs">Loading image...</p>
                  </div>
                ) : viewImageData ? (
                  <img src={viewImageData} alt={viewImage.title} className="max-h-[60vh] w-auto object-contain rounded-lg" />
                ) : (
                  <div className="text-center text-slate-400">
                    <i className="bi bi-image fs-3xl mb-2 block"></i>
                    <p className="fs-xs">Image not available</p>
                  </div>
                )}
              </div>
              {viewImage.description && (
                <p className="mt-3 fs-xs text-slate-600">{viewImage.description}</p>
              )}
              <div className="mt-2">
                <Badge label={viewImage.category} variant="info" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
