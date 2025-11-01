"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, TrendingDown } from "lucide-react"

interface ShapExplanation {
  shap_values?: {
    [key: string]: number
  }
  feature_importance?: {
    [key: string]: number
  }
  prediction?: string
  confidence?: number
}

interface ShapVisualizationProps {
  explanation: ShapExplanation | null
}

export function ShapVisualization({ explanation }: ShapVisualizationProps) {
  // Don't render if no SHAP data
  if (!explanation || !explanation.shap_values) {
    return null
  }

  const { shap_values, feature_importance, prediction, confidence } = explanation

  // Sort features by absolute importance
  const sortedFeatures = Object.entries(shap_values || {})
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .slice(0, 5) // Top 5 features

  // Format feature names to be human-readable
  const formatFeatureName = (name: string): string => {
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Get max absolute value for scaling bars
  const maxAbsValue = Math.max(...sortedFeatures.map(([, val]) => Math.abs(val)))

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <CardTitle>AI Decision Explanation (SHAP)</CardTitle>
        </div>
        <CardDescription>
          Feature contributions to the priority prediction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prediction Summary */}
        {prediction && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Predicted Action:</span>
              <span className="text-sm font-bold capitalize">{prediction}</span>
            </div>
            {confidence && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-medium">Confidence:</span>
                <span className="text-sm font-bold">{(confidence * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Feature Contributions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Top Contributing Factors:
          </h4>
          {sortedFeatures.map(([feature, value]) => {
            const percentage = (Math.abs(value) / maxAbsValue) * 100
            const isPositive = value > 0

            return (
              <div key={feature} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{formatFeatureName(feature)}</span>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={isPositive ? "text-green-600" : "text-red-600"}>
                      {value > 0 ? '+' : ''}{value.toFixed(3)}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isPositive 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Explanation Text */}
        <div className="pt-3 border-t text-xs text-muted-foreground">
          <p>
            <strong>How to read:</strong> Positive values (green) increase the likelihood of escalation,
            while negative values (red) decrease it. The length of each bar shows the relative importance
            of that feature in the decision.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
