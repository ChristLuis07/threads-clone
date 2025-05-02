"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toggleLike, getLikeStatus } from "@/lib/actions/thread.action";
import { formatDateString } from "@/lib/utils";

interface Props {
    id: string,
    currentUserId: string,
    parentId: string | null,
    content: string,
    author: {
        name: string,
        image: string,
        id: string
    },
    community: {
        id: string,
        name: string,
        image: string,
    } | null,
    createdAt: string,
    comments: {
        author: {
            image: string;
        }
    }[] 
    isComment?: boolean;
    enableLikeFeature?: boolean;
}

const ThreadCard = ({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
  enableLikeFeature = false,
} : Props) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (hasInitialized || !enableLikeFeature || !currentUserId || !id) return;

        const fetchLikeStatus = async () => {
            try {
                const likeStatus = await getLikeStatus({
                    threadId: id,
                    userId: currentUserId
                });

                setIsLiked(likeStatus.isLiked);
                setLikesCount(likeStatus.likesCount);
                setHasInitialized(true);
            } catch (error) {
                console.error("Failed to fetch like status:", error);
                setHasInitialized(true);
            }
        };

        fetchLikeStatus();
    }, [id, currentUserId, enableLikeFeature, hasInitialized]);

    const handleLikeClick = async () => {
        if (!currentUserId || !enableLikeFeature || isLoading) return;

        setIsLoading(true);

        try {
            const newIsLiked = !isLiked;
            const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
            
            setIsLiked(newIsLiked);
            setLikesCount(newLikesCount);

            const result = await toggleLike({
                threadId: id,
                userId: currentUserId,
                path: window.location.pathname
            });

            if (result.isLiked !== newIsLiked) {
                setIsLiked(result.isLiked);
            }
            
            if (result.likesCount !== newLikesCount) {
                setLikesCount(result.likesCount);
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
            setIsLiked(!isLiked);
            setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <article className={`flex w-full flex-col rounded-xl  ${isComment ? 'px-0 xs:px-7' : 'bg-dark-2 p-7'}`}>
            <div className="flex items-start justify-between">
                <div className="flex w-full flex-1 flex-row gap-4">
                    <div className="flex flex-col items-center">
                        <Link
                        href={`/profile/${author.id}`}
                        className="relative h-11 w-11"
                        >
                            <Image 
                            src={author.image}
                            alt="Profile Image"
                            fill
                            className="cursor-pointer rounded-full"
                            />
                        </Link>
                        <div className="thread-card_bar"/>
                    </div>
                    <div className="flex w-full flex-col">
                        <Link
                            href={`/profile/${author.id}`}
                            className="w-fit"
                        >
                            <h4 className="cursor-pointer text-base-semibold text-light-1">{author.name}</h4>
                        </Link>
                        <p className="mt-2 text-small-regular text-light-2">{content}</p>
                        <div className={`${isComment && 'mb-10'} mt-5 flex flex-col gap-3`}>
                            <div className="flex gap-3.5">
                                {enableLikeFeature ? (
                                    <div className="flex items-center gap-1">
                                        <Image
                                            src={isLiked ? "/assets/heart-filled.svg" : "/assets/heart-gray.svg"}
                                            alt="heart"
                                            width={24}
                                            height={24}
                                            className={`cursor-pointer object-contain ${isLoading ? 'opacity-50' : ''}`}
                                            onClick={handleLikeClick}
                                        />
                                        {likesCount > 0 && (
                                            <span className="text-small-regular text-gray-1">{likesCount}</span>
                                        )}
                                    </div>
                                ) : (
                                    <Image 
                                    src="/assets/heart-gray.svg" 
                                    alt="heart" 
                                    width={24}     
                                    height={24}
                                    className="cursor-pointer object-contain"
                                    />
                                )}
                                <Link
                                href={`/thread/${id}`}
                                >
                                    <Image 
                                    src="/assets/reply.svg" 
                                    alt="reply" 
                                    width={24}     
                                    height={24}
                                    className="cursor-pointer object-contain"
                                    />
                                </Link>
                            
                                <Image 
                                src="/assets/repost.svg" 
                                alt="repost" 
                                width={24}     
                                height={24}
                                className="cursor-pointer object-contain"
                                />
                                <Image 
                                src="/assets/share.svg" 
                                alt="share" 
                                width={24}     
                                height={24}
                                className="cursor-pointer object-contain"
                                />
                            </div>
                            {isComment && comments.length > 0 && (
                                <Link href={`/thread/${id}`}>
                                    <p className="mt-1 text-subtle-medium text-gray-1">{comments.length} replies</p>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>                
            </div>
            {!isComment && community && (
                    <Link href={`/communities/${community.id}`} className="mt-5 flex items-center">
                        <p className="text-subtle-medium text-gray-1">
                            {formatDateString(createdAt)}
                            {" "} - {community.name} Community
                        </p>
                        <Image 
                        src={community.image}
                        alt={community.name}
                        width={14}
                        height={14}
                        className="ml-1 rounded-full object-cover"
                        />
                    </Link>
                )}
        </article>
        
    )
};

export default ThreadCard;