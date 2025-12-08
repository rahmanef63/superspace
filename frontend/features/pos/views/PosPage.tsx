"use client"

import React, { useState } from "react"
import { ShoppingCart, Plus, Minus, CreditCard, Banknote, Search, Package } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { usePos } from "../hooks/usePos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface PosPageProps {
  workspaceId?: Id<"workspaces"> | null
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

/**
 * POS Page Component
 */
export default function PosPage({ workspaceId }: PosPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const { isLoading, products, todaySales } = usePos(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use POS
          </p>
        </div>
      </div>
    )
  }

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product._id)
      if (existing) {
        return prev.map((item) =>
          item.id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { id: product._id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const filteredProducts = products.filter((p: any) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full">
      {/* Products Section */}
      <div className="flex flex-1 flex-col border-r">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Point of Sale</h1>
              <p className="text-sm text-muted-foreground">
                Today: ${todaySales?.total?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product: any) => (
                <Card
                  key={product._id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg bg-muted mb-2 flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium truncate">{product.name}</h4>
                    <p className="text-lg font-bold text-primary">
                      ${product.price?.toFixed(2)}
                    </p>
                    {product.stock !== undefined && (
                      <Badge variant="outline" className="mt-1">
                        Stock: {product.stock}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="flex w-96 flex-col bg-muted/30">
        <div className="border-b p-4">
          <h2 className="text-lg font-bold">Current Order</h2>
          <p className="text-sm text-muted-foreground">{cart.length} items</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Total & Payment */}
        <div className="border-t p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2" disabled={cart.length === 0}>
              <Banknote className="h-4 w-4" />
              Cash
            </Button>
            <Button className="gap-2" disabled={cart.length === 0}>
              <CreditCard className="h-4 w-4" />
              Card
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
