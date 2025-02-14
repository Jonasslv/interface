import React from 'react'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { TYPE, StyledInternalLink } from '../../theme'
import DoubleCurrencyLogo from '../DoubleLogo'
import { CAVAX, JSBI, Token, Fraction } from '@pangolindex/sdk'
import { ButtonPrimary } from '../Button'
import { Staking, StakingInfo } from '../../state/stake/hooks'
import { useColor } from '../../hooks/useColor'
import { currencyId } from '../../utils/currencyId'
import { Break, CardNoise, CardBGImage } from './styled'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { PNG } from '../../constants'
import { useTranslation } from 'react-i18next'

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
   display: none;
 `};
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%, ${showBackground ? theme.black : theme.bg5} 100%) `};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;

  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
     0px 24px 32px rgba(0, 0, 0, 0.01);`}
`

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr auto 120px;
  grid-gap: 0px;
  align-items: center;
  padding: 1rem;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
     grid-template-columns: 48px 1fr auto 96px;
   `};
`


const BottomSection = styled.div<{ showBackground: boolean }>`
  padding: 12px 16px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  z-index: 1;
`

export default function PoolCard({
  stakingInfo,
  migration,
  version,
  apr
}: {
  stakingInfo: StakingInfo
	migration?: Staking
  version: string
  apr: string
}) {
  const token0 = stakingInfo.tokens[0]
  const token1 = stakingInfo.tokens[1]

  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)

  const { t } = useTranslation()
  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))

  const token: Token = currency0 === CAVAX || currency1 === CAVAX
    ? currency0 === CAVAX ? token1 : token0
    : token0.equals(PNG[token0.chainId]) ? token1 : token0

  // get the color of the token
  const backgroundColor = useColor(token)

  const weeklyRewardAmount = stakingInfo.totalRewardRate.multiply(JSBI.BigInt(60 * 60 * 24 * 7))
  let weeklyRewardPerAvax = weeklyRewardAmount.divide(stakingInfo.totalStakedInWavax)
  if (JSBI.EQ(weeklyRewardPerAvax.denominator, 0)) {
    weeklyRewardPerAvax = new Fraction(JSBI.BigInt(0), JSBI.BigInt(1))
  }

  return (
    <Wrapper showBackground={isStaking} bgColor={backgroundColor}>
      <CardBGImage desaturate />
      <CardNoise />

      <TopSection>
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
        <TYPE.white fontWeight={600} fontSize={24} style={{ marginLeft: '8px' }}>
          {currency0.symbol}-{currency1.symbol}
        </TYPE.white>

        {(migration && isStaking) ? (
          <StyledInternalLink
            to={`/migrate/${currencyId(currency0)}/${currencyId(currency1)}/${Number(version)}/${currencyId(migration.tokens[0])}/${currencyId(migration.tokens[1])}/${migration?.version}`}
              style={{ marginRight: '10px' }}
            >
            <ButtonPrimary padding='8px' borderRadius='8px'>
              Migrate
            </ButtonPrimary>
          </StyledInternalLink>
        ) : (
          <span></span>
        )}

        {(isStaking || !stakingInfo.isPeriodFinished) && (
          <StyledInternalLink
            to={`/png/${currencyId(currency0)}/${currencyId(currency1)}/${version}`}
            style={{ width: '100%' }}
          >
            <ButtonPrimary padding="8px" borderRadius="8px">
              {isStaking ? t('earn.manage') : t('earn.deposit')}
            </ButtonPrimary>
          </StyledInternalLink>
        )}
      </TopSection>

      <StatContainer>
        <RowBetween>
          <TYPE.white> {t('earn.totalDeposited')}</TYPE.white>
          <TYPE.white>
            {`${stakingInfo.totalStakedInWavax.toSignificant(4, { groupSeparator: ',' }) ?? '-'} AVAX`}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> {t('earn.poolRate')} </TYPE.white>
          <TYPE.white>{stakingInfo.isPeriodFinished ? `-` : `${weeklyRewardAmount.toFixed(0, { groupSeparator: ',' })} ${t('earn.pngWeek')}`}</TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> {t('earn.currentReward')} </TYPE.white>
          <TYPE.white>{stakingInfo.isPeriodFinished ? `-` : `${weeklyRewardPerAvax.toFixed(4, {groupSeparator: ','}) ?? '-'} ${t('earn.pngPerAvax')}`}</TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> {t('earn.earnUpTo')} </TYPE.white>
          <TYPE.white>{`${apr}%`}</TYPE.white>
        </RowBetween>
      </StatContainer>

      {isStaking && (
        <>
          <Break />
          <BottomSection showBackground={true}>
            <TYPE.black color={'white'} fontWeight={500}>
              <span>{t('earn.yourRate')}</span>
            </TYPE.black>

            <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                ⚡
              </span>
              {`${stakingInfo.rewardRate
                ?.multiply(`${60 * 60 * 24 * 7}`)
                ?.toSignificant(4, { groupSeparator: ',' })} PNG / week`}
            </TYPE.black>
          </BottomSection>
        </>
      )}
    </Wrapper>
  )
}
