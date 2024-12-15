import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import styled from "styled-components";
import SearchBar from "../components/notice/SearchBar";
import CategoryTabs from "../components/notice/CategoryTabs";
import SupportList from "../components/notice/SupportList";
import { FAQResponseDto, NoticeResponseDto } from "../types/supportTypes";
import noticeService from "src/features/support/services/noticeService";
import faqService from "../services/FAQService";
import { faqDummyData } from "../services/dummyData";
import FAQList from "../components/FaqList";

// 스타일 정의
const Container = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 1280px;
  padding: 40px 40px 160px;
  overflow: hidden;
`;

const Title = styled.div`
  border-bottom: 3px solid #222;
  padding-bottom: 16px;

  h3 {
    font-size: 24px;
    line-height: 29px;
    letter-spacing: -0.36px;
  }
`;

const Pagination = styled.div`
  padding: 28px 0;
  text-align: center;

  button {
    margin: 0 5px;
    padding: 5px 10px;
    border: none;
    background-color: #fff;
    border: 1px solid #ddd;
    cursor: pointer;

    &.active {
      font-weight: bold;
      background-color: #000;
      color: #fff;
    }

    &:hover {
      background-color: #f4f4f4;
    }
  }
`;

const NoDataContainer = styled.div`
  background-color: #fff;
  padding: 120px 0 100px;
  position: relative;
  text-align: center;
`;

const NoDataMessage = styled.p`
  color: rgba(34, 34, 34, 0.8);
  font-size: 16px;
  letter-spacing: -0.16px;
`;

const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQResponseDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const { keyword, category } = queryString.parse(location.search);

  const faqsPerPage = 10; // 한 페이지에 보여줄 데이터 개수

  // 데이터 가져오기
  const fetchFaqs = async () => {
    try {
      if (keyword) {
        const response = await faqService.searchFAQs(
          keyword as string,
          currentPage,
          faqsPerPage
        );
        setFaqs(response.data.content);
        setTotalPages(response.data.totalPages);
      } else if (category && category !== "전체") {
        const response = await faqService.getFAQsByCategory(
          category as string,
          currentPage,
          faqsPerPage
        );
        setFaqs(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        const response = await faqService.getFAQs(currentPage, faqsPerPage);
        setFaqs(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("API 요청 실패:", error);
      // 더미 데이터 처리
      const filtered = faqDummyData.content.filter((faq) => {
        if (keyword) return faq.question.includes(keyword as string);
        if (category) return category === "전체" || faq.category === category;
        return true;
      });

      // 더미 데이터에서 페이징 적용
      const startIndex = (currentPage - 1) * faqsPerPage;
      const endIndex = startIndex + faqsPerPage;
      setFaqs(filtered.slice(startIndex, endIndex));
      setTotalPages(Math.ceil(filtered.length / faqsPerPage));
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [keyword, category, currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query: string) => {
    setCurrentPage(1);
    navigate(`?keyword=${query}&list=true`);
  };

  const handleCategoryChange = (selectedCategory: string) => {
    setCurrentPage(1);
    navigate(`?category=${selectedCategory}&list=true`);
  };

  return (
    <Container>
      <Title>
        <h3>자주 묻는 질문</h3>
      </Title>

      {location.pathname === "/support/faq" ? (
        <>
          <SearchBar onSearch={handleSearch} />
          {!keyword && (
            <CategoryTabs
              categories={["전체", "이용정책", "공통", "구매", "판매"]}
              activeCategory={category ? (category as string) : "전체"}
              onCategoryChange={handleCategoryChange}
            />
          )}
          {faqs.length === 0 ? (
            <NoDataContainer>
              <NoDataMessage>검색하신 결과가 없습니다.</NoDataMessage>
            </NoDataContainer>
          ) : (
            <>
              <FAQList faqs={faqs} />
              <Pagination>
                <button onClick={() => handlePageChange(1)}>&laquo;</button>
                <button onClick={() => handlePageChange(currentPage - 1)}>
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)}>
                  &gt;
                </button>
                <button onClick={() => handlePageChange(totalPages)}>
                  &raquo;
                </button>
              </Pagination>
            </>
          )}
        </>
      ) : (
        <Outlet />
      )}
    </Container>
  );
};

export default FAQPage;
