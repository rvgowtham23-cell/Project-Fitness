import React from 'react';
import type { DailyNutritionSummary, NutritionTargets } from '@fitness/shared-types';
import { colors } from '../../theme';
import { Card, ProgressBar } from '../ui';

interface Props {
  summary: DailyNutritionSummary;
  targets: NutritionTargets;
}

export function MacroProgressGrid({ summary, targets }: Props) {
  return (
    <Card>
      <ProgressBar label="Protein" value={summary.totalProteinG} target={targets.proteinTargetG} color={colors.macro.protein} />
      <ProgressBar label="Carbs" value={summary.totalCarbsG} target={targets.carbTargetG} color={colors.macro.carbs} />
      <ProgressBar label="Fat" value={summary.totalFatG} target={targets.fatTargetG} color={colors.macro.fat} />
      <ProgressBar label="Fiber" value={summary.totalFiberG} target={targets.fiberTargetG} color={colors.macro.fiber} />
      <ProgressBar
        label="Water"
        value={summary.totalWaterMl}
        target={targets.waterTargetMl}
        unit="ml"
        color={colors.macro.water}
      />
    </Card>
  );
}
