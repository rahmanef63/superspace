"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import { useBackend } from "../shared/hooks/useBackend";

import { ArrowLeft } from "lucide-react";
import { ShareButtons } from "../shared/components/ShareButtons";
import { Comments } from "../shared/components/Comments";
import ContentRecommendations from "../shared/components/ContentRecommendations";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useLanguage();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const backend = useBackend();      backend.posts.get({ slug, locale })
        .then((res) => setPost(res.post))
        .catch(() => setPost(null))
        .finally(() => setLoading(false));
    }
  }, [slug, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">Post not found</p>
            <Link to="/blog" className="text-primary hover:underline">
              ← Back to blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        <article>
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full rounded-lg shadow-lg mb-8"
            />
          )}
          
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          {post.publishedAt && (
            <p className="text-foreground/60 mb-6">
              {new Date(post.publishedAt).toLocaleDateString(locale)}
            </p>
          )}

          <ShareButtons
            url={`/blog/${post.slug}`}
            title={post.title}
            description={post.excerpt}
            className="mb-8"
          />
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="whitespace-pre-wrap">{post.body}</p>
          </div>

          <Comments postId={post.id} />

          <ContentRecommendations 
            contentId={String(post.id)} 
            contentType="post" 
            locale={locale} 
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}


